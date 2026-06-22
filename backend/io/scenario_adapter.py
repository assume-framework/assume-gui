"""Bidirectional adapter between the ASSUME CSV/YAML scenario format and the
ReactFlow JSON consumed by assume-gui.

The CSV/YAML layout is the documented stable input of the simulation engine.
The ReactFlow shape is dictated by xyflow on the editor side. This adapter
keeps both formats authoritative and translates between them, instead of
inventing a third format.
"""

from __future__ import annotations

import shutil
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import pandas as pd
import yaml

from backend.utils import read_file, write_file

_RRULE_MINUTES = {
    "h": 60,
    "1h": 60,
    "60min": 60,
    "30min": 30,
    "15min": 15,
    "1d": 1440,
    "24h": 1440,
}

_MISSING_VALUES = {"None", "nan", "NaN", "NaT", "<NA>"}

# ASSUME stores demand and storage charging power as negative values, see
# assume.scenario.loader_csv.load_scenario_folder
NEGATIVE_COLUMNS = {
    "demand": ("min_power", "max_power"),
    "storage": ("max_power_charge", "min_power_charge"),
}

UNIT_FILES = {
    "power_plant": "powerplant_units.csv",
    "demand": "demand_units.csv",
    "storage": "storage_units.csv",
    "exchange": "exchange_units.csv",
    "industrial_dsm": "industrial_dsm_units.csv",
}

TIME_SERIES = {
    "demand": ("demand_df.csv", ""),
    "availability": ("availability_df.csv", ""),
    "fuel_prices": ("fuel_prices_df.csv", ""),
    "volume_import": ("exchanges_df.csv", "_import"),
    "volume_export": ("exchanges_df.csv", "_export"),
}

GLOBAL_FORECASTS = {
    "price": "price_forecast.csv",
    "residual_load": "residual_load_forecast.csv",
}


def _frequency_to_string(value: Any) -> str:
    if value is None:
        return "HOURLY"
    s = str(value).lower().strip()
    mapping = {
        "1h": "HOURLY",
        "h": "HOURLY",
        "1d": "DAILY",
        "d": "DAILY",
        "1w": "WEEKLY",
        "w": "WEEKLY",
        "1m": "MONTHLY",
    }
    return mapping.get(s, "HOURLY")


def _duration_to_minutes(value: Any) -> int:
    if value is None:
        return 60
    if isinstance(value, (int, float)):
        return int(value)
    s = str(value).lower().strip()
    if s in _RRULE_MINUTES:
        return _RRULE_MINUTES[s]
    if s.endswith("h"):
        return int(float(s[:-1]) * 60)
    if s.endswith("min"):
        return int(float(s[:-3]))
    if s.endswith("d"):
        return int(float(s[:-1]) * 1440)
    try:
        return int(s)
    except ValueError:
        return 60


@dataclass
class FlowNode:
    id: str
    type: str
    data: dict[str, Any] = field(default_factory=dict)


@dataclass
class FlowEdge:
    id: str
    type: str
    source: str
    target: str
    sourceHandle: str = ""
    targetHandle: str = ""
    data: dict[str, Any] = field(default_factory=dict)


def _new_id(node_type: str) -> str:
    return f"{node_type}_{uuid.uuid4()}"


def _make_edge(
    source_id: str,
    source_type: str,
    target_id: str,
    target_type: str,
    data: dict[str, Any] | None = None,
) -> FlowEdge:
    source_handle = f"{target_type}_handle"
    target_handle = f"{source_type}_handle"
    edge_type = (
        "unit-market"
        if source_type == "market" and target_type == "unit"
        else "default"
    )
    return FlowEdge(
        id=f"{source_id}#{source_handle}#{target_id}#{target_handle}",
        type=edge_type,
        source=source_id,
        target=target_id,
        sourceHandle=source_handle,
        targetHandle=target_handle,
        data=data or {},
    )


def _read_csv(path: Path) -> pd.DataFrame | None:
    if not path.exists():
        return None
    return pd.read_csv(path, index_col=0)


def _edge_endpoints(edge: dict) -> tuple[str | None, str | None]:
    source = edge.get("source")
    target = edge.get("target")
    if source and target:
        return source, target
    parts = str(edge.get("id", "")).split("#")
    if len(parts) == 4:
        return parts[0], parts[2]
    return source, target


def csv_to_flow(
    scenario_path: str | Path, study_case: str | None = None
) -> dict[str, Any]:
    """Load a CSV/YAML scenario folder and return the ReactFlow JSON."""
    path = Path(scenario_path).expanduser().resolve()
    config_file = path / "config.yaml"
    if not config_file.exists():
        raise FileNotFoundError(f"config.yaml not found in {path}")

    with config_file.open("r", encoding="utf-8") as f:
        full_config = yaml.safe_load(f)

    if not study_case:
        study_case = next(iter(full_config))
    if study_case not in full_config:
        raise KeyError(f"study case {study_case!r} not found in config.yaml")
    config = full_config[study_case]

    nodes: list[FlowNode] = []
    edges: list[FlowEdge] = []
    nodes_by_name: dict[str, FlowNode] = {}
    market_ids_by_name: dict[str, str] = {}

    nodes.append(
        FlowNode(
            id="world",
            type="world",
            data={
                "name": "world",
                "simulation_id": f"{path.name}_{study_case}",
                "start": str(config.get("start_date", "")),
                "end": str(config.get("end_date", "")),
                "frequency": _minutes_to_freq(
                    _duration_to_minutes(config.get("time_step"))
                ),
                "save_frequency_hours": str(config.get("save_frequency_hours") or 24),
            },
        )
    )

    markets_config = config.get("markets_config", {}) or {}

    market_provider_id = _new_id("marketProvider")
    nodes.append(
        FlowNode(
            id=market_provider_id,
            type="marketProvider",
            data={"name": "default_market_provider"},
        )
    )
    edges.append(_make_edge("world", "world", market_provider_id, "marketProvider"))

    for market_name, market_cfg in markets_config.items():
        market_id = _new_id("market")
        market_ids_by_name[market_name] = market_id
        products = market_cfg.get("products", []) or []
        product_ids: list[str] = []
        for i, product in enumerate(products):
            product_id = _new_id("marketProduct")
            product_ids.append(product_id)
            nodes.append(
                FlowNode(
                    id=product_id,
                    type="marketProduct",
                    data={
                        "name": f"product_{i}",
                        "duration": str(_duration_to_minutes(product.get("duration"))),
                        "count": str(product.get("count", 1)),
                        "first_delivery": str(
                            _duration_to_minutes(product.get("first_delivery", "0h"))
                        ),
                        "only_hours": _format_only_hours(product.get("only_hours")),
                        "eligible_lambda_function": product.get(
                            "eligible_lambda_function"
                        )
                        or "",
                    },
                )
            )

        nodes.append(
            FlowNode(
                id=market_id,
                type="market",
                data={
                    "name": market_name,
                    "operator": market_cfg.get("operator", "EOM_operator"),
                    "market_mechanism": market_cfg.get(
                        "market_mechanism", "pay_as_clear"
                    ),
                    "opening_hours": _frequency_to_string(
                        market_cfg.get("opening_frequency")
                    ),
                    "opening_duration": str(
                        _duration_to_minutes(market_cfg.get("opening_duration"))
                    ),
                    "product_type": market_cfg.get("product_type", "energy"),
                    "maximum_bid_volume": str(
                        market_cfg.get("maximum_bid_volume", 100000)
                    ),
                    "maximum_bid_price": str(market_cfg.get("maximum_bid_price", 3000)),
                    "minimum_bid_price": str(market_cfg.get("minimum_bid_price", -500)),
                    "additional_fields": ", ".join(
                        market_cfg.get("additional_fields", []) or []
                    ),
                    "volume_unit": market_cfg.get("volume_unit", "MWh"),
                    "volume_tick": str(market_cfg.get("volume_tick", "")),
                    "price_unit": market_cfg.get("price_unit", "EUR/MWh"),
                    "price_tick": str(market_cfg.get("price_tick", "")),
                },
            )
        )
        edges.append(
            _make_edge(market_provider_id, "marketProvider", market_id, "market")
        )
        for product_id in product_ids:
            edges.append(_make_edge(market_id, "market", product_id, "marketProduct"))

    operator_ids_by_name: dict[str, str] = {}

    def operator_node(name: str) -> str:
        if name not in operator_ids_by_name:
            new_operator_id = _new_id("unitOperator")
            operator_ids_by_name[name] = new_operator_id
            nodes.append(
                FlowNode(id=new_operator_id, type="unitOperator", data={"name": name})
            )
            edges.append(_make_edge("world", "world", new_operator_id, "unitOperator"))
        return operator_ids_by_name[name]

    for unit_type_label, csv_name in UNIT_FILES.items():
        df = _read_csv(path / csv_name)
        if df is None or df.empty:
            continue
        for column in NEGATIVE_COLUMNS.get(unit_type_label, ()):
            if column in df.columns:
                df[column] = -df[column].abs()
        for unit_name, row in df.iterrows():
            unit_id = _new_id("unit")
            data = {"name": str(unit_name), "unitType": unit_type_label}
            for col in df.columns:
                value = row[col]
                if pd.isna(value) or str(value) in _MISSING_VALUES:
                    data[col] = ""
                else:
                    data[col] = str(value)
            unit_node = FlowNode(id=unit_id, type="unit", data=data)
            nodes.append(unit_node)
            nodes_by_name[str(unit_name)] = unit_node
            operator_name = data.get("unit_operator") or "default_operator"
            operator_id = operator_node(operator_name)
            edges.append(_make_edge(operator_id, "unitOperator", unit_id, "unit"))
            for market_name in markets_config:
                market_id = market_ids_by_name[market_name]
                strategy_col = f"bidding_{market_name}"
                if strategy_col not in df.columns:
                    continue
                strategy = row[strategy_col]
                if pd.isna(strategy) or not str(strategy).strip():
                    continue
                edges.append(
                    _make_edge(
                        market_id,
                        "market",
                        unit_id,
                        "unit",
                        data={"strategy": str(strategy)},
                    )
                )

    _split_time_series(path, nodes_by_name)

    forecasts = _build_forecasts_section(path)

    return {
        "nodes": [vars(n) for n in nodes],
        "edges": [vars(e) for e in edges],
        "forecasts": forecasts,
    }


def _build_forecasts_section(path: Path) -> dict[str, str | None]:
    forecasts: dict[str, str | None] = {key: None for key in GLOBAL_FORECASTS}
    for key, csv_name in GLOBAL_FORECASTS.items():
        source = path / csv_name
        if source.exists():
            uid = str(uuid.uuid4())
            write_file(uid, source.read_text(encoding="utf-8"))
            forecasts[key] = uid
    return forecasts


def _write_forecasts_section(target: Path, forecasts: dict[str, Any]) -> None:
    for key, csv_name in GLOBAL_FORECASTS.items():
        uid = forecasts.get(key)
        if not uid:
            continue
        try:
            canonical_uid = str(uuid.UUID(str(uid)))
        except (ValueError, TypeError, AttributeError) as exc:
            raise ValueError(f"invalid {key} forecast file id") from exc
        source = Path(__file__).parents[1] / "tmp" / f"{canonical_uid}.csv"
        if not source.is_file():
            raise FileNotFoundError(f"uploaded {key} forecast file was not found")
        shutil.copyfile(source, target / csv_name)


def _split_time_series(path: Path, nodes_by_name: dict[str, FlowNode]) -> None:
    for csv_name in dict.fromkeys(name for name, _ in TIME_SERIES.values()):
        df = _read_csv(path / csv_name)
        if df is None:
            continue
        kinds = [(k, s) for k, (name, s) in TIME_SERIES.items() if name == csv_name]
        for column in df.columns:
            for kind, suffix in kinds:
                if suffix and not column.endswith(suffix):
                    continue
                node = nodes_by_name.get(column[: -len(suffix)] if suffix else column)
                if node is None:
                    continue
                uid = str(uuid.uuid4())
                write_file(uid, df[[column]].to_csv())
                node.data[f"forecast_{kind}"] = uid
                break


def _forecast_series(value: Any, index: pd.DatetimeIndex, field: str) -> pd.Series:
    try:
        scalar = float(value)
    except (TypeError, ValueError):
        scalar = None
    if scalar is not None:
        return pd.Series(scalar, index=index)

    try:
        uid = str(uuid.UUID(str(value)))
    except (ValueError, TypeError, AttributeError) as exc:
        raise ValueError(f"invalid uploaded file id for {field}") from exc

    frame = read_file(uid, series=False)
    if frame.empty:
        raise ValueError(f"uploaded file for {field} is empty")
    if frame.shape[1] == 1:
        if len(frame) != len(index):
            raise ValueError(f"uploaded file for {field} has the wrong length")
        return pd.Series(frame.iloc[:, 0].to_numpy(), index=index)
    return frame.set_index(frame.columns[0])[frame.columns[-1]]


def _write_time_series(
    target: Path, unit_nodes: list[dict], index: pd.DatetimeIndex
) -> None:
    columns_by_file: dict[str, list[pd.Series]] = {}
    for kind, (csv_name, suffix) in TIME_SERIES.items():
        key = f"forecast_{kind}"
        for node in unit_nodes:
            data = node.get("data", {})
            uid = data.get(key)
            if not uid:
                continue
            column = _forecast_series(uid, index, key)
            column.name = f"{data.get('name') or node['id']}{suffix}"
            columns_by_file.setdefault(csv_name, []).append(column)
    for csv_name, columns in columns_by_file.items():
        pd.concat(columns, axis=1).to_csv(target / csv_name)


def _format_only_hours(value: Any) -> str:
    if not value:
        return ""
    if isinstance(value, (list, tuple)) and len(value) == 2:
        return f"{value[0]},{value[1]}"
    return str(value)


def _parse_only_hours(value: Any) -> list[int] | None:
    if value in (None, ""):
        return None
    if isinstance(value, (list, tuple)) and len(value) == 2:
        return [int(value[0]), int(value[1])]
    parts = [part.strip() for part in str(value).strip("[]() ").split(",")]
    if len(parts) != 2 or not all(parts):
        raise ValueError("only_hours must contain exactly two hours")
    return [int(parts[0]), int(parts[1])]


def _parse_string_list(value: Any) -> list[str]:
    if value in (None, ""):
        return []
    if isinstance(value, (list, tuple)):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in str(value).split(",") if item.strip()]


def flow_to_csv(
    flow: dict[str, Any], target_path: str | Path, study_case: str = "base"
) -> Path:
    """Write a ReactFlow JSON document to a CSV/YAML scenario folder."""
    target = Path(target_path).expanduser().resolve()
    target.mkdir(parents=True, exist_ok=True)

    nodes_by_id: dict[str, dict] = {n["id"]: n for n in flow.get("nodes", [])}
    edges = flow.get("edges", [])
    edges_by_source: dict[str, list[dict]] = {}
    edges_by_target: dict[str, list[dict]] = {}
    for edge in edges:
        src, tgt = _edge_endpoints(edge)
        if src is not None:
            edges_by_source.setdefault(src, []).append(edge)
        if tgt is not None:
            edges_by_target.setdefault(tgt, []).append(edge)

    def _node_type(node_id: str | None) -> str:
        return nodes_by_id.get(node_id, {}).get("type", "") if node_id else ""

    world_node = nodes_by_id.get("world")
    if not world_node:
        raise ValueError("flow document is missing a world node")
    world_data = world_node.get("data", {})

    market_cfgs: dict[str, dict] = {}
    for market_node in (n for n in nodes_by_id.values() if n.get("type") == "market"):
        market_id = market_node["id"]
        market_data = market_node.get("data", {})
        market_name = market_data.get("name") or market_id

        products = []
        for edge in edges_by_source.get(market_id, []):
            _, tgt = _edge_endpoints(edge)
            if _node_type(tgt) != "marketProduct":
                continue
            product_node = nodes_by_id.get(tgt)
            if not product_node:
                continue
            pd_data = product_node.get("data", {})
            product = {
                "duration": _minutes_to_freq(pd_data.get("duration")),
                "count": int(_to_number(pd_data.get("count"), 1)),
                "first_delivery": _minutes_to_freq(pd_data.get("first_delivery", 0)),
            }
            only_hours = _parse_only_hours(pd_data.get("only_hours"))
            if only_hours is not None:
                product["only_hours"] = only_hours
            eligible = pd_data.get("eligible_lambda_function")
            if eligible not in (None, ""):
                product["eligible_lambda_function"] = eligible
            products.append(product)

        market_cfgs[market_name] = {
            "operator": market_data.get("operator") or "EOM_operator",
            "product_type": market_data.get("product_type", "energy"),
            "products": products,
            "opening_frequency": _string_to_freq(market_data.get("opening_hours")),
            "opening_duration": _minutes_to_freq(
                market_data.get("opening_duration", 60)
            ),
            "additional_fields": _parse_string_list(
                market_data.get("additional_fields")
            ),
            "volume_unit": market_data.get("volume_unit", "MWh"),
            "volume_tick": _to_optional_number(market_data.get("volume_tick")),
            "maximum_bid_volume": _to_number(
                market_data.get("maximum_bid_volume"), 100000
            ),
            "maximum_bid_price": _to_number(market_data.get("maximum_bid_price"), 3000),
            "minimum_bid_price": _to_number(market_data.get("minimum_bid_price"), -500),
            "price_unit": market_data.get("price_unit", "EUR/MWh"),
            "price_tick": _to_optional_number(market_data.get("price_tick")),
            "market_mechanism": market_data.get("market_mechanism", "pay_as_clear"),
        }

    config = {
        study_case: {
            "start_date": world_data.get("start", ""),
            "end_date": world_data.get("end", ""),
            "time_step": _string_to_freq(world_data.get("frequency", "HOURLY")),
            "save_frequency_hours": int(
                _to_number(world_data.get("save_frequency_hours"), 24)
            ),
            "markets_config": market_cfgs,
        }
    }
    with (target / "config.yaml").open("w", encoding="utf-8") as f:
        yaml.safe_dump(config, f, sort_keys=False)

    units_by_kind: dict[str, list[dict]] = {kind: [] for kind in UNIT_FILES}
    for node in nodes_by_id.values():
        if node.get("type") != "unit":
            continue
        data = dict(node.get("data", {}))
        unit_type = data.pop("unitType", "")
        if unit_type not in units_by_kind:
            continue
        unit_id = data.pop("name", "") or node["id"]
        # Market participation is represented by ReactFlow edges. Remove the
        # imported CSV copies so deleted edges cannot silently reappear.
        for key in [key for key in data if key.startswith("bidding_")]:
            data.pop(key)
        for kind in TIME_SERIES:
            data.pop(f"forecast_{kind}", None)
        operator = data.get("unit_operator") or "EOM_operator"
        for edge in edges_by_target.get(node["id"], []):
            src, _ = _edge_endpoints(edge)
            src_type = _node_type(src)
            source_node = nodes_by_id.get(src)
            if not source_node:
                continue
            if src_type == "market":
                market_name = source_node.get("data", {}).get("name") or src
                strategy = (edge.get("data") or {}).get("strategy", "naive_eom")
                data[f"bidding_{market_name}"] = strategy
            elif src_type == "unitOperator":
                operator = source_node.get("data", {}).get("name") or operator
        data["unit_operator"] = operator
        data["unit_id"] = unit_id
        units_by_kind[unit_type].append(data)

    for kind, rows in units_by_kind.items():
        if not rows:
            continue
        df = pd.DataFrame(rows)
        if "unit_id" in df.columns:
            df = df.set_index("unit_id")
            df.index.name = "name"
        df.to_csv(target / UNIT_FILES[kind])

    unit_nodes = [n for n in nodes_by_id.values() if n.get("type") == "unit"]
    index = pd.date_range(
        start=world_data.get("start"),
        end=world_data.get("end"),
        freq=_string_to_freq(world_data.get("frequency", "HOURLY")),
    )
    _write_time_series(target, unit_nodes, index)
    _write_forecasts_section(target, flow.get("forecasts", {}))

    return target


def _to_number(value: Any, default: float) -> float:
    if value in (None, ""):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _to_optional_number(value: Any) -> float | None:
    if value in (None, "", "None", "nan", "NaN"):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _minutes_to_freq(value: Any) -> str:
    minutes = _duration_to_minutes(value)
    if minutes % 1440 == 0:
        return f"{minutes // 1440}d"
    if minutes % 60 == 0:
        return f"{minutes // 60}h"
    return f"{minutes}min"


def _string_to_freq(value: Any) -> str:
    s = str(value or "HOURLY").strip()
    words = {"HOURLY": "1h", "DAILY": "24h", "WEEKLY": "1w", "MONTHLY": "1m"}
    if s.upper() in words:
        return words[s.upper()]
    return _minutes_to_freq(_duration_to_minutes(s))


__all__ = [
    "csv_to_flow",
    "flow_to_csv",
    "FlowNode",
    "FlowEdge",
]
