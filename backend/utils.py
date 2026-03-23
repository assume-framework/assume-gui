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
        loaded[type] = read_file(value, series=False)
    return loaded


def read_file(id: str, series: bool = True) -> pd.Series | pd.DataFrame:
    path = Path(__file__).parent / "tmp" / f"{id}.csv"
    if series:
        return pd.read_csv(path, header=None)[0]
    return pd.read_csv(path)


def write_file(id: str, content: str):
    path = Path(__file__).parent / "tmp" / f"{id}.csv"
    path.parent.mkdir(exist_ok=True, parents=True)
    path.open("w+").write(content)
