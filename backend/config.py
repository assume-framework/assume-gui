from datetime import timedelta
from enum import Enum

import pandas as pd
from assume.common.exceptions import ValidationError


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

    def __getitem__(self, key: str):
        """
        Get a required field from the node data. Raises ValidationError if the field is missing.
        """
        try:
            return self.data[key]
        except KeyError:
            raise ValidationError(f"{key} is required", id=self.id, field=key)

    def get_date(self, key: str, default=""):
        date_field = self[key] if default == "" else self.get(key, default)
        try:
            return pd.to_datetime(date_field)
        except Exception:
            raise ValidationError("invalid date", id=self.id, field=key)

    def get(self, key: str, default=None):
        """Get an optional field from the node data. Returns default if the field is missing."""
        return self.data.get(key, default)


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
            pd.date_range(
                start=start, end=end + timedelta(hours=24), freq=world_cfg["frequency"]
            ),
        )

    def get_node(self, unit_id: str):
        return NodeConfig(self.nodes[unit_id])

    def get_edges(self, unit_id: str, edge_type: EdgeType):
        try:
            return [EdgeConfig(e) for e in self.edges[unit_id][edge_type.value]]
        except KeyError:
            raise ValidationError(
                f"No edges of type {edge_type.value} found for unit {unit_id}",
                id=unit_id,
                field="edges",
            )

    def world_id(self):
        for n in self.nodes:
            if self.nodes[n]["type"] == "world":
                return n
        raise ValueError("World node not found")
