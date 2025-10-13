
from datetime import datetime, timedelta
import json

import pandas as pd
from assume import MarketConfig, MarketProduct, World
from assume.common.forecasts import NaiveForecast
from dateutil import rrule as rr


def source_target(connection: str):
    return connection.split("#")[0], connection.split("#")[2]


def getType(id: str):
    return id.split("_")[0]

def process_data(input: dict):
    nodes = {i["id"]: i for i in input["nodes"]}
    edges = {}
    for i in input["edges"]:
        source, target = source_target(i["id"])
        i["target"] = target
        edges.setdefault(source, {}).setdefault(getType(target), []).append(i)
    world = World(
        database_uri="postgresql://assume@localhost:5432/assume?password=assume"
    )
    worldData = nodes["world"]["data"]
    start, end = (
        datetime.fromisoformat(worldData["start"]),
        datetime.fromisoformat(worldData["end"]),
    )
    index = pd.date_range(
        start=start,
        end=end + timedelta(hours=24),
        freq=worldData["frequency"],
    )
    world.setup(
        start=start,
        end=end,
        save_frequency_hours=worldData["save_frequency_hours"],
        simulation_id=worldData["simulation_id"],
        index=index,
    )

    # market_operators, unit_operators = [], []
    # for target in edges["world"]:
    #     if target.startswith("marketProvider"):
    #         market_operators.append(target)
    #         world.add_market_operator(target)
    #     elif target.startswith("unitOperator"):
    #         unit_operators.append(target)
    #         world.add_unit_operator(target)
    #     else:
    #         raise ValueError(f"Unknown target: {target}")

    # add markets
    for market_operator in edges["world"]["marketProvider"]:
        target_market_operator = market_operator["target"]
        world.add_market_operator(target_market_operator)
        for market in edges[target_market_operator]["market"]:
            target_market = market["target"]
            market_products = []
            for market_product in edges[target_market]["marketProduct"]:
                target_market_product = market_product["target"]
                productData = nodes[target_market_product]["data"]
                market_products.append(
                    MarketProduct(
                        duration=timedelta(minutes=int(productData["duration"])),
                        count=int(productData["count"]),
                        first_delivery=timedelta(
                            minutes=int(productData["first_delivery"])
                        ),
                    )
                )
            data = nodes[target_market]["data"]
            print(data)
            world.add_market(
                market_operator_id=target_market_operator,
                market_config=MarketConfig(
                    market_id=target_market,
                    market_mechanism=data["market_mechanism"],
                    opening_hours=rr.rrule(
                        rr.HOURLY, interval=24, dtstart=start, until=end
                    ),
                    opening_duration=timedelta(minutes=int(data["opening_duration"])),
                    market_products=market_products,
                ),
            )
    for unit_operator in edges["world"]["unitOperator"]:
        target_unit_operator = unit_operator["target"]
        world.add_unit_operator(target_unit_operator)
        for unit in edges[target_unit_operator]["unit"]:
            target_unit = unit["target"]
            bidding_strategies = {}
            for connection in edges[target_unit]["market"]:
                strategy_data = connection["data"]
                bidding_strategies[strategy_data["name"]] = strategy_data["strategy"]
            unitData = nodes[target_unit]["data"]
            forecast = NaiveForecast(index, demand=100)
            world.add_unit(
                id=target_unit,
                unit_operator_id=target_unit_operator,
                unit_type=unitData["unitType"],
                unit_params={
                    "bidding_strategies": bidding_strategies,
                    "technology": unitData.get("technology"),
                    "min_power": int(unitData.get("min_power", 0)),
                    "max_power": int(unitData.get("max_power", 0)),
                    "efficiency": float(unitData.get("efficiency", 0)),
                    "ramp_up": int(unitData.get("ramp_up", 0)),
                    "ramp_down": int(unitData.get("ramp_down", 0)),
                    "emission_factor": float(unitData.get("emission_factor", 0)),
                    "min_operating_time": int(unitData.get("min_operating_time", 0)),
                    "min_downtime": int(unitData.get("min_downtime", 0)),
                    "max_power_charge": int(unitData.get("max_power_charge", 0)),
                    "max_power_discharge": int(unitData.get("max_power_discharge", 0)),
                    "max_soc": int(unitData.get("max_soc", 0)),
                },
                forecaster=forecast,
            )
    return world

def test():
    with open("backend/data.json", "r") as f:
        input = json.load(f)
        world = process_data(input)
        world.run()
# test()