#!/usr/bin/env python3
"""Convert a flow file from before the scenario file format existed into the scenario file format.

The old format is `{nodes, edges, forecasts?}`, as downloaded from the editor or stored in
localStorage under "flow".

    python scripts/convert_flow.py old.json [new.json]

Without an output path, `<input>.converted.json` is written next to the input.
"""

import json
import sys
from pathlib import Path

UI_ONLY_FIELDS = {"errorField", "errorMessage"}


def fail(message: str) -> None:
    sys.exit(f"Error: {message}")


def clean_data(data) -> dict:
    items = data.items() if isinstance(data, dict) else []
    return {
        "name": "",
        **{
            k: v
            for k, v in items
            if isinstance(v, str) and k not in UI_ONLY_FIELDS
        },
    }


def convert(flow) -> dict:
    if not isinstance(flow, dict) or not isinstance(flow.get("nodes"), list):
        fail('input has no "nodes" list')
    raw_edges = flow.get("edges") or []
    if not isinstance(raw_edges, list):
        fail('"edges" must be a list')

    nodes, edges = {}, {}
    layout = {"nodes": {}, "edges": {}}

    for n in flow["nodes"]:
        if not isinstance(n, dict) or not isinstance(n.get("id"), str):
            fail("node without id")
        if not isinstance(n.get("type"), str):
            fail(f"node {n['id']} has no type")
        nodes[n["id"]] = {
            "id": n["id"],
            "type": n["type"],
            "data": clean_data(n.get("data")),
        }
        pos = n.get("position")
        if (
            isinstance(pos, dict)
            and isinstance(pos.get("x"), (int, float))
            and isinstance(pos.get("y"), (int, float))
        ):
            layout["nodes"][n["id"]] = {"x": pos["x"], "y": pos["y"]}
    if "world" not in nodes:
        fail('input has no "world" node')

    for e in raw_edges:
        if not isinstance(e, dict) or not isinstance(e.get("id"), str):
            fail("edge without id")
        for key in ("type", "source", "target"):
            if not isinstance(e.get(key), str):
                fail(f"edge {e['id']} has no {key}")
        edges[e["id"]] = {
            "id": e["id"],
            "type": e["type"],
            "source": e["source"],
            "target": e["target"],
            "data": clean_data(e.get("data")),
        }
        layout["edges"][e["id"]] = {
            "sourceHandle": e.get("sourceHandle")
            if isinstance(e.get("sourceHandle"), str)
            else None,
            "targetHandle": e.get("targetHandle")
            if isinstance(e.get("targetHandle"), str)
            else None,
        }

    old_forecasts = flow.get("forecasts")
    old_forecasts = old_forecasts if isinstance(old_forecasts, dict) else {}
    forecasts = {
        key: old_forecasts[key] if isinstance(old_forecasts.get(key), str) else None
        for key in ("price", "residual_load")
    }

    return {
        "format": "assume-gui/scenario",
        "version": 1,
        "config": {"nodes": nodes, "edges": edges, "forecasts": forecasts},
        "layout": layout,
    }


def main() -> None:
    if len(sys.argv) not in (2, 3):
        fail("usage: python scripts/convert_flow.py <old.json> [new.json]")
    source = Path(sys.argv[1])
    try:
        flow = json.loads(source.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        fail(f"cannot read {source}: {e}")
    target = (
        Path(sys.argv[2])
        if len(sys.argv) == 3
        else source.with_name(source.stem + ".converted.json")
    )
    target.write_text(json.dumps(convert(flow)), encoding="utf-8")
    print(f"Wrote {target}")


if __name__ == "__main__":
    main()
