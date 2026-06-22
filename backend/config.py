import re
from enum import Enum
from pathlib import Path
from typing import TypeAlias

import pandas as pd
from assume.common.exceptions import ValidationError
from assume.common.market_objects import OnlyHours
from assume.common.utils import load_index_file

from backend.utils import read_file


class EdgeType(Enum):
    unit_operator = "unitOperator"
    unit = "unit"
    market_provider = "marketProvider"
    market_product = "marketProduct"
    market = "market"


# use alias so python doesn't confuse the base types with methods of FieldConfig
s: TypeAlias = str
i: TypeAlias = int
f: TypeAlias = float


class FieldConfig:
    def __init__(self, field: s, id: s, cfg: s):
        self.field = field
        self.id = id
        self.content = cfg

    def _error(self, message: s):
        raise ValidationError(
            message=message,
            id=self.id,
            field=self.field,
        )

    def _check_value(self):
        if self.content.strip() == "":
            self._error(f"{self.field} is required")

    def int(self) -> i:
        self._check_value()
        return int(self.content)

    def float(self) -> f:
        self._check_value()
        return float(self.content)

    def optional_float(self, default: f = None) -> None | f:
        if self.content == "":
            return default
        return float(self.content)

    def str(self) -> s:
        self._check_value()
        return self.content

    def offset(self) -> pd.tseries.offsets.BaseOffset:
        self._check_value()
        try:
            return pd.tseries.frequencies.to_offset(self.content)
        except ValueError:
            self._error(f"{self.field} must be a valid time delta e.g. '1h'")

    def only_hours(self) -> s:
        if (
            self.content is None
            or self.content == ""
            or len(self.content.split(",")) != 2
        ):
            return None
        return OnlyHours(
            int(self.content.split(",")[0]), int(self.content.split(",")[1])
        )

    def optional_str(self, default: s = None):
        if self.content == "":
            return default
        return self.content

    def date(self) -> pd.Timestamp:
        self._check_value()
        try:
            return pd.to_datetime(self.content)
        except ValueError:
            self._error(f"{self.field} must be a valid date format")

    def comma_array(self, required=False) -> list[s]:
        if required:
            self._check_value()
        if self.content == '':
            return []
        return [value.strip() for value in self.content.split(",")]

    def optional_file(self, index: pd.DatetimeIndex = None) -> f | pd.DataFrame:
        self._check_value()
        if not re.match(
            r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
            self.content,
        ):
            return self.float()
        # load file
        path = Path(__file__).parent / "tmp" / f"{self.content}.csv"
        if index is None:
            return read_file(path)
        try:
            data = load_index_file(path, index)
            data = data[data.columns[0]]
        except Exception as e:
            self._error(f"uploaded file {self.content} for {self.field} did have {e}")
        return data


class NodeConfig:
    def __init__(self, cfg: dict):
        self.data = cfg["data"]
        self.id = cfg["id"]
        self.type = cfg["type"]

    def __getitem__(self, key: str) -> FieldConfig:
        """
        Get a required field from the node data. Raises ValidationError if the field is missing.
        """
        if key in self.data:
            return FieldConfig(key, self.id, self.data[key])
        raise ValidationError(f"{key} is required", id=self.id, field=key)


class EdgeConfig:
    def __init__(self, cfg: dict):
        self.data = cfg["data"]
        self.id = cfg["id"]
        self.type = cfg["type"]
        self.target = cfg["target"]
        self.source = cfg["source"]

    def __getitem__(self, key: str, default=None):
        try:
            return self.data[key]
        except KeyError:
            raise ValidationError(f"{key} is required", id=self.id, field=key)


class Config:
    def __init__(self, data: dict):
        nodes = {i["id"]: i for i in data["nodes"]}
        edges = {}
        targets = {}
        for e in data["edges"]:
            source, _, t, _ = e["id"].split("#")
            e["target"] = t
            e["source"] = source
            targets.setdefault(t, {}).setdefault(source.split("_")[0], []).append(e)
            edges.setdefault(source, {}).setdefault(t.split("_")[0], []).append(e)
        self.nodes = nodes
        self.edges = edges
        self.edge_targets = targets
        self.forecasts = data.get("forecasts", {})
        self.start, self.end, self.index = self._simulation_time()

    def _simulation_time(self) -> tuple[pd.Timestamp, pd.Timestamp, pd.DatetimeIndex]:
        world_cfg = self.get_node("world")
        start = world_cfg["start"].date()
        end = world_cfg["end"].date()
        frq = world_cfg["frequency"].offset()
        return (
            start,
            end,
            pd.date_range(start=start, end=end, freq=frq),
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

    def get_edge_targets(self, unit_id: str, edge_type: EdgeType) -> list[EdgeConfig]:
        try:
            return [EdgeConfig(t) for t in self.edge_targets[unit_id][edge_type.value]]
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
