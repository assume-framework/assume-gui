import os
from pathlib import Path

import pandas as pd

DBURI = os.getenv(
    "DATABASE_URL", "postgresql://assume@localhost:5432/assume?password=assume"
)


def load_forecasts(forecasts: dict):
    loaded = {}
    for type, value in forecasts.items():
        if value is None:
            continue
        loaded[type] = read_file(value)
    return loaded


def read_file(id: str):
    path = Path(__file__).parent / "tmp" / f"{id}.csv"
    return pd.read_csv(path)


def write_file(id: str, content: str):
    path = Path(__file__).parent / "tmp" / f"{id}.csv"
    path.parent.mkdir(exist_ok=True, parents=True)
    path.open("w+").write(content)
