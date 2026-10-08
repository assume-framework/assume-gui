import os
import re
from pathlib import Path

import pandas as pd
from assume.common.exceptions import ValidationError

DBURI = os.getenv(
    "DATABASE_URL", "postgresql://assume@localhost:5432/assume?password=assume"
)
TMP_DIR = Path(__file__).parent / "tmp"
TMP_DIR.mkdir(exist_ok=True, parents=True)


def is_uuid(value: str) -> bool:
    uuid_regex = re.compile(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    )
    return uuid_regex.match(value) is not None

def tmp_path(file_id: str) -> Path:
    return TMP_DIR / f"{file_id}.csv"

def load_forecasts(forecasts: dict):
    loaded = {}
    for type, value in forecasts.items():
        if value is None:
            continue
        loaded[type] = read_df(value)
    return loaded

def read_df(file_id: str) -> pd.Series | pd.DataFrame:
    if not is_uuid(file_id):
        raise ValidationError(message=f"unexpected id {file_id}")
    return pd.read_csv(tmp_path(file_id), index_col=0, parse_dates=True)

def read_series(file_id: str) -> pd.Series:
    return pd.read_csv(tmp_path(file_id), header=None)[0]

def write_file(file_id: str, content: str):
    tmp_path(file_id).write_text(content)
