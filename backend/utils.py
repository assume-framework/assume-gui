import os
from datetime import datetime
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
        path = Path(__file__).parent / "tmp" / f"{value}.csv"
        loaded[type] = pd.read_csv(path)
    return loaded


def date(date_str: str):
    return datetime.fromisoformat(date_str)
