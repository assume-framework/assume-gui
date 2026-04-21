from enum import Enum
from pathlib import Path

import pandas as pd
from assume.common.exceptions import ValidationError
from assume.common.utils import load_index_file

from backend.utils import read_file


class EdgeType(Enum):
    unit_operator = "unitOperator"
    unit = "unit"
    market_provider = "marketProvider"
    market_product = "marketProduct"
    market = "market"


class NodeConfig:
    def __init__(self, cfg: dict):
        self.data = cfg["data"]
        self.id = cfg["id"]
        self.type = cfg["type"]

    def __getitem__(self, key: str) -> str:
        """
        Get a required field from the node data. Raises ValidationError if the field is missing.
        """
        try:
            return self.data[key]
        except KeyError:
            raise ValidationError(f"{key} is required", id=self.id, field=key)

    def get_date(self, key: str, default="") -> pd.Timestamp:
        date_field = self[key] if default == "" else self.get(key, default)
        try:
            return pd.to_datetime(date_field)
        except Exception:
            raise ValidationError("invalid date", id=self.id, field=key)

    def get(self, key: str, default=None):
        """Get an optional field from the node data. Returns default if the field is missing."""
        return self.data.get(key, default)

    def get_comma_array(self, key: str, default=[]):
        """Get an optional field from the node data. Returns default if the field is missing."""
        str_list = self.data.get(key, default)
        if not str_list:
            return default
        return [value.strip() for value in str_list.split(",")]

    def get_optional_file(self, key: str, default=None, index=None):
        entry = self.get(key, default)
        if isinstance(entry, str):
            if len(entry) == 36:
                path = Path(__file__).parent / "tmp" / f"{entry}.csv"
                if index is None:
                    return read_file(path)
                try:
                    data = load_index_file(path, index)
                    data = data[data.columns[0]]
                except Exception as e:
                    raise ValidationError(
                        message=f"uploaded file {entry} for {key} did have {e}",
                        id=self.id,
                        field=key,
                    )
                return data
            return float(entry)  # try to convert to float
        return entry


class EdgeConfig:
    def __init__(self, cfg: dict):
        self.data = cfg["data"]
        self.id = cfg["id"]
        self.type = cfg["type"]
        self.target = cfg["target"]

    def __getitem__(self, key: str, default=None):
        try:
            return self.data[key]
        except KeyError:
            raise ValidationError(f"{key} is required", id=self.id, field=key)


class Config:
    def __init__(self, data: dict):
        nodes = {i["id"]: i for i in data["nodes"]}
        edges = {}
        for e in data["edges"]:
            source, _, target, _ = e["id"].split("#")
            e["target"] = target
            edges.setdefault(source, {}).setdefault(target.split("_")[0], []).append(e)
        self.nodes = nodes
        self.edges = edges
        self.forecasts = data.get("forecasts", {})
        self.start, self.end, self.index = self._simulation_time()

    def _simulation_time(self) -> tuple[pd.Timestamp, pd.Timestamp, pd.DatetimeIndex]:
        world_cfg = self.get_node("world")
        start = world_cfg.get_date("start")
        end = world_cfg.get_date("end")
        return (
            start,
            end,
            pd.date_range(start=start, end=end, freq=world_cfg["frequency"]),
        )

    def get_node(self, unit_id: str) -> NodeConfig:
        return NodeConfig(self.nodes[unit_id])

    def get_edges(self, unit_id: str, edge_type: EdgeType) -> list[EdgeConfig]:
        try:
            return [EdgeConfig(e) for e in self.edges[unit_id][edge_type.value]]
        except KeyError:
            raise ValidationError(
                f"No edges of type {edge_type.value} found for unit {unit_id}",
                id=unit_id,
                field="edges",
            )

    def world_id(self) -> str:
        for n in self.nodes:
            if self.nodes[n]["type"] == "world":
                return n
        raise ValueError("World node not found")
