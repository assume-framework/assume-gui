import copy
import io
import zipfile
from pathlib import Path

import pandas as pd
import pytest
import yaml
from assume.common.exceptions import ValidationError
from fastapi.testclient import TestClient

import backend.process as process_module
from backend.config import Config, EdgeType, FieldConfig
from backend.io import zip_utils
from backend.io.scenario_adapter import csv_to_flow, flow_to_csv
from backend.io.zip_utils import scenario_root, unzip_to_temp, zip_folder
from backend.main import app
from backend.utils import read_file


@pytest.fixture
def scenario(tmp_path: Path) -> Path:
    (tmp_path / "config.yaml").write_text(
        "base:\n"
        "  start_date: 2019-01-01 00:00\n"
        "  end_date: 2019-01-01 02:00\n"
        "  time_step: 1h\n"
        "  save_frequency_hours: 24\n"
        "  markets_config:\n"
        "    EOM:\n"
        "      operator: EOM_operator\n"
        "      product_type: energy\n"
        "      products:\n"
        "        - duration: 1h\n"
        "          count: 1\n"
        "          first_delivery: 1h\n"
        "      opening_frequency: 1h\n"
        "      opening_duration: 1h\n"
        "      market_mechanism: pay_as_clear\n",
        encoding="utf-8",
    )
    (tmp_path / "powerplant_units.csv").write_text(
        "name,technology,bidding_EOM,fuel_type,max_power,min_power,efficiency,unit_operator\n"
        "pp_1,nuclear,naive_eom,uranium,1000.0,200.0,0.3,pp_operator\n",
        encoding="utf-8",
    )
    (tmp_path / "demand_units.csv").write_text(
        "name,technology,bidding_EOM,max_power,min_power,unit_operator\n"
        "demand_1,inflex,naive_eom,1000.0,0.0,demand_operator\n",
        encoding="utf-8",
    )
    (tmp_path / "demand_df.csv").write_text(
        "datetime,demand_1\n"
        "2019-01-01 00:00,800\n"
        "2019-01-01 01:00,820\n"
        "2019-01-01 02:00,810\n",
        encoding="utf-8",
    )
    return tmp_path


def _unit_node(flow: dict, name: str) -> dict:
    for node in flow["nodes"]:
        if node["type"] == "unit" and node["data"].get("name") == name:
            return node
    raise AssertionError(f"unit {name!r} not found in flow")


def _as_browser_payload(flow: dict) -> dict:
    return {
        "nodes": [
            {"id": n["id"], "type": n["type"], "data": n["data"]} for n in flow["nodes"]
        ],
        "edges": [
            {
                "id": e["id"],
                "type": e["type"],
                "source": e["source"],
                "target": e["target"],
                "data": e.get("data"),
            }
            for e in flow["edges"]
        ],
        "forecasts": flow.get("forecasts", {}),
    }


def test_field_config_conversions_and_string_representation():
    value = FieldConfig("count", "product", "2")
    blank = FieldConfig("count", "product", "")

    assert value.optional_int() == 2
    assert str(value) == "2"
    assert blank.optional_int() is None
    assert blank.optional_int(3) == 3


def test_csv_to_flow_creates_boxes(scenario: Path):
    flow = csv_to_flow(scenario)
    types = [n["type"] for n in flow["nodes"]]
    assert "world" in types
    assert "market" in types
    assert types.count("unit") == 2


def test_time_series_split(scenario: Path):
    flow = csv_to_flow(scenario)
    demand = _unit_node(flow, "demand_1")
    assert "forecast_demand" in demand["data"]
    uid = demand["data"]["forecast_demand"]
    series = read_file(uid, series=False)
    assert list(series.iloc[:, -1]) == [800, 820, 810]


def test_round_trip_csv_flow_csv(scenario: Path, tmp_path: Path):
    flow = csv_to_flow(scenario)
    out = tmp_path / "exported"
    flow_to_csv(_as_browser_payload(flow), out)
    assert (out / "config.yaml").exists()
    assert (out / "powerplant_units.csv").exists()
    reloaded = csv_to_flow(out)
    names = {n["data"]["name"] for n in reloaded["nodes"] if n["type"] == "unit"}
    assert names == {"pp_1", "demand_1"}


def test_market_and_product_fields_round_trip(scenario: Path, tmp_path: Path):
    config_path = scenario / "config.yaml"
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    market = config["base"]["markets_config"]["EOM"]
    market.update(
        {
            "operator": "custom_market_operator",
            "additional_fields": ["bid_type", "node"],
            "volume_tick": 0.1,
            "price_tick": 0.01,
        }
    )
    market["products"][0].update(
        {
            "only_hours": [8, 20],
            "eligible_lambda_function": "custom_eligibility",
        }
    )
    config_path.write_text(yaml.safe_dump(config, sort_keys=False), encoding="utf-8")

    flow = csv_to_flow(scenario)
    out = tmp_path / "exported"
    flow_to_csv(_as_browser_payload(flow), out)

    exported = yaml.safe_load((out / "config.yaml").read_text(encoding="utf-8"))
    exported_market = exported["base"]["markets_config"]["EOM"]
    assert exported_market["operator"] == "custom_market_operator"
    assert exported_market["additional_fields"] == ["bid_type", "node"]
    assert exported_market["volume_tick"] == 0.1
    assert exported_market["price_tick"] == 0.01
    assert exported_market["products"][0]["only_hours"] == [8, 20]
    assert (
        exported_market["products"][0]["eligible_lambda_function"]
        == "custom_eligibility"
    )


def test_import_produces_valid_backend_config(scenario: Path):
    flow = csv_to_flow(scenario)
    cfg = Config(flow)

    provider_edges = cfg.get_edges("world", EdgeType.market_provider)
    assert provider_edges
    for provider_edge in provider_edges:
        market_edges = cfg.get_edges(provider_edge.target, EdgeType.market)
        assert market_edges
        for market_edge in market_edges:
            assert cfg.get_edges(market_edge.target, EdgeType.market_product)

    operator_edges = cfg.get_edges("world", EdgeType.unit_operator)
    assert len(operator_edges) == 2
    units = []
    for operator_edge in operator_edges:
        for unit_edge in cfg.get_edges(operator_edge.target, EdgeType.unit):
            units.append(unit_edge.target)
            bids = cfg.get_edge_targets(unit_edge.target, EdgeType.market)
            assert bids
            assert bids[0]["strategy"] == "naive_eom"
    assert len(units) == 2


def test_imported_scenario_can_be_prepared_for_submit(
    scenario: Path, monkeypatch: pytest.MonkeyPatch
):
    (scenario / "exchange_units.csv").write_text(
        "name,bidding_EOM,unit_operator\nexchange_1,naive_exchange,exchange_operator\n",
        encoding="utf-8",
    )

    class FakeWorld:
        def __init__(self):
            self.markets = []
            self.units = []

        def setup(self, **kwargs):
            self.setup_args = kwargs

        def add_market_operator(self, operator_id):
            self.market_operator = operator_id

        def add_market(self, market_operator_id, market_config):
            self.markets.append((market_operator_id, market_config))

        def add_unit_operator(self, operator_id):
            pass

        def add_unit_instance(self, operator_id, unit):
            self.units.append((operator_id, unit))

    world = FakeWorld()
    monkeypatch.setattr(process_module, "World", lambda database_uri: world)

    result = process_module.process_data(csv_to_flow(scenario))

    assert result is world
    assert len(world.markets) == 1
    units = {unit.id: unit for _, unit in world.units}
    assert set(units) == {"pp_1", "demand_1", "exchange_1"}
    assert units["demand_1"].max_price == 3000.0
    assert units["exchange_1"].price_import == 0.0
    assert units["exchange_1"].price_export == 2999.0


def test_time_series_round_trip(scenario: Path, tmp_path: Path):
    flow = csv_to_flow(scenario)
    out = tmp_path / "exported"
    flow_to_csv(_as_browser_payload(flow), out)
    assert (out / "demand_df.csv").exists()
    df = pd.read_csv(out / "demand_df.csv", index_col=0)
    assert list(df["demand_1"]) == [800, 820, 810]


def test_global_forecasts_round_trip(scenario: Path, tmp_path: Path):
    price = pd.DataFrame(
        {"datetime": ["2019-01-01 00:00", "2019-01-01 01:00"], "EOM": [42, 43]}
    )
    residual = pd.DataFrame(
        {
            "datetime": ["2019-01-01 00:00", "2019-01-01 01:00"],
            "EOM": [100, 101],
        }
    )
    price.to_csv(scenario / "price_forecast.csv", index=False)
    residual.to_csv(scenario / "residual_load_forecast.csv", index=False)

    flow = csv_to_flow(scenario)
    assert flow["forecasts"]["price"] not in (None, "price_forecast.csv")
    assert flow["forecasts"]["residual_load"] not in (
        None,
        "residual_load_forecast.csv",
    )

    cfg = Config(flow)
    pd.testing.assert_frame_equal(cfg.forecasts["price"], price)
    pd.testing.assert_frame_equal(cfg.forecasts["residual_load"], residual)

    out = tmp_path / "exported"
    flow_to_csv(_as_browser_payload(flow), out)
    pd.testing.assert_frame_equal(pd.read_csv(out / "price_forecast.csv"), price)
    pd.testing.assert_frame_equal(
        pd.read_csv(out / "residual_load_forecast.csv"), residual
    )


def test_global_forecast_rejects_invalid_file_id(scenario: Path):
    flow = csv_to_flow(scenario)
    flow["forecasts"]["price"] = "../../private-data"
    with pytest.raises(ValidationError, match="invalid uploaded file id"):
        Config(flow)


def test_blank_bidding_cell_does_not_add_market_participation(
    scenario: Path, tmp_path: Path
):
    config_path = scenario / "config.yaml"
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    config["base"]["markets_config"]["CRM"] = copy.deepcopy(
        config["base"]["markets_config"]["EOM"]
    )
    config_path.write_text(yaml.safe_dump(config, sort_keys=False), encoding="utf-8")

    plants_path = scenario / "powerplant_units.csv"
    plants = pd.read_csv(plants_path, index_col=0)
    plants["bidding_CRM"] = pd.NA
    plants.to_csv(plants_path)

    demands_path = scenario / "demand_units.csv"
    demands = pd.read_csv(demands_path, index_col=0)
    demands["bidding_CRM"] = "naive_eom"
    demands.to_csv(demands_path)

    flow = csv_to_flow(scenario)
    market_names = {
        node["id"]: node["data"]["name"]
        for node in flow["nodes"]
        if node["type"] == "market"
    }
    plant_id = _unit_node(flow, "pp_1")["id"]
    demand_id = _unit_node(flow, "demand_1")["id"]

    def participating_markets(unit_id: str) -> set[str]:
        return {
            market_names[edge["source"]]
            for edge in flow["edges"]
            if edge["target"] == unit_id and edge["source"] in market_names
        }

    assert participating_markets(plant_id) == {"EOM"}
    assert participating_markets(demand_id) == {"EOM", "CRM"}

    out = tmp_path / "exported"
    flow_to_csv(_as_browser_payload(flow), out)
    exported_plants = pd.read_csv(out / "powerplant_units.csv", index_col=0)
    assert "bidding_CRM" not in exported_plants.columns


def test_zip_round_trip(scenario: Path):
    zip_path = zip_folder(scenario)
    assert zip_path.exists()
    root = scenario_root(unzip_to_temp(zip_path))
    assert (root / "config.yaml").exists()
    assert (root / "powerplant_units.csv").exists()


def test_http_zip_import_export_round_trip(scenario: Path):
    source_zip = zip_folder(scenario)
    with TestClient(app) as client, source_zip.open("rb") as archive:
        imported = client.post(
            "/api/import",
            files={"file": ("scenario.zip", archive, "application/zip")},
        )
        assert imported.status_code == 200, imported.text

        exported = client.post("/api/export", json=imported.json())
        assert exported.status_code == 200, exported.text
        assert exported.headers["content-type"].startswith("application/zip")
        assert exported.content.startswith(b"PK")


def _zip_buffer(entries: dict[str, str]) -> io.BytesIO:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, content in entries.items():
            archive.writestr(name, content)
    buffer.seek(0)
    return buffer


def test_zip_rejects_too_many_entries(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(zip_utils, "MAX_ZIP_FILES", 1)
    with pytest.raises(ValueError, match="too many entries"):
        unzip_to_temp(_zip_buffer({"config.yaml": "base: {}", "units.csv": "x"}))


def test_zip_rejects_oversized_expansion(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(zip_utils, "MAX_ZIP_TOTAL_SIZE", 4)
    with pytest.raises(ValueError, match="expands beyond"):
        unzip_to_temp(_zip_buffer({"config.yaml": "base: {}"}))


def test_zip_rejects_unsafe_compression_ratio(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(zip_utils, "MAX_ZIP_COMPRESSION_RATIO", 2)
    with pytest.raises(ValueError, match="compression ratio"):
        unzip_to_temp(_zip_buffer({"data.csv": "0" * 10_000}))
