from datetime import timedelta

from assume import MarketConfig, MarketProduct, World
from assume.common.forecaster import (
    DemandForecaster,
    ExchangeForecaster,
    ForecastIndex,
    PowerplantForecaster,
    UnitForecaster,
)
from assume.common.market_objects import OnlyHours
from dateutil import rrule as rr
from dateutil.relativedelta import relativedelta

from backend.config import Config, EdgeType
from backend.utils import DBURI


def process_data(input: dict):
    cfg = Config(input)
    worldcfg = cfg.get_node("world")

    world = World(database_uri=DBURI)
    world.setup(
        start=cfg.start,
        end=cfg.end,
        save_frequency_hours=int(worldcfg["save_frequency_hours"]),
        simulation_id=worldcfg["simulation_id"],
    )

    add_markets(world, cfg)
    add_units(world, cfg)
    return world


def add_markets(world: World, cfg: Config):
    # add markets
    for operator_edge in cfg.get_edges("world", EdgeType.market_provider):
        world.add_market_operator(operator_edge.target)
        for market_edge in cfg.get_edges(operator_edge.target, EdgeType.market):
            market_products = []
            for product_edge in cfg.get_edges(
                market_edge.target, EdgeType.market_product
            ):
                productData = cfg.get_node(product_edge.target)
                market_products.append(
                    MarketProduct(
                        duration=relativedelta(minutes=int(productData["duration"])),
                        count=int(productData["count"]),
                        first_delivery=relativedelta(
                            minutes=int(productData["first_delivery"])
                        ),
                        only_hours=_only_hours(productData.get("only_hours", "")),
                        eligible_lambda_function=_optional_string(
                            productData.get("eligible_lambda_function")
                        ),
                    )
                )
            data = cfg.get_node(market_edge.target)
            world.add_market(
                market_operator_id=operator_edge.target,
                market_config=MarketConfig(
                    market_id=data["name"],
                    market_mechanism=data["market_mechanism"],
                    opening_hours=rr.rrule(
                        freq=rr.HOURLY, interval=24, dtstart=cfg.start, until=cfg.end
                    ),
                    opening_duration=timedelta(minutes=int(data["opening_duration"])),
                    market_products=market_products,
                ),
            )


def forecaster_for_type(
    index: ForecastIndex, data: dict, global_forecasts: dict
) -> UnitForecaster:
    forecasts = data.get("forecasts", {})
    price_forecast = global_forecasts.get("price", None)
    residual_forecast = global_forecasts.get("residual_load", None)
    match data["unitType"]:
        case "demand":
            return DemandForecaster(
                index=index,
                availability=forecasts.get("availability", 1),
                demand=forecasts.get("demand", -100),
                market_prices=price_forecast,
                residual_load=residual_forecast,
            )
        case "power_plant":
            return PowerplantForecaster(
                index=index,
                availability=forecasts.get("availability", 1),
                market_prices=price_forecast,
                residual_load=residual_forecast,
            )
        case "exchange":
            return ExchangeForecaster(
                index=index,
                availability=forecasts.get("availability", 1),
                market_prices=price_forecast,
                residual_load=residual_forecast,
            )
        case "storage":
            return UnitForecaster(
                index=index,
                availability=forecasts.get("availability", 1),
                market_prices=price_forecast,
                residual_load=residual_forecast,
            )
    raise NotImplementedError(
        f"Forecaster for unit type {data['unitType']} is not implemented."
    )


def add_units(world: World, cfg: Config):
    for operator_edge in cfg.get_edges("world", EdgeType.unit_operator):
        world.add_unit_operator(operator_edge.target)
        for unit_edge in cfg.get_edges(operator_edge.target, EdgeType.unit):
            bidding_strategies = {}
            for connection in cfg.get_edges(unit_edge.target, EdgeType.market):
                bidding_strategies[connection.target] = connection["strategy"]
            unitData = cfg.get_node(unit_edge.target)
            world.add_unit(
                id=unitData["name"],
                unit_operator_id=operator_edge.target,
                unit_type=unitData["unitType"],
                unit_params={
                    "bidding_strategies": bidding_strategies,
                    "technology": unitData.get("technology"),
                    "min_power": int(unitData.get("min_power", 0)),
                    "max_power": int(unitData.get("max_power", 0)),
                    "capacity": float(unitData.get("capacity", 0)),
                    "price": float(unitData.get("price", 0)),
                    "efficiency": float(unitData.get("efficiency", 1.0)),
                    "ramp_up": int(unitData.get("ramp_up", 0)),
                    "ramp_down": int(unitData.get("ramp_down", 0)),
                    "emission_factor": float(unitData.get("emission_factor", 0)),
                    "min_operating_time": int(unitData.get("min_operating_time", 0)),
                    "min_downtime": int(unitData.get("min_downtime", 0)),
                    "max_power_charge": int(unitData.get("max_power_charge", 0)),
                    "max_power_discharge": int(unitData.get("max_power_discharge", 0)),
                    "max_soc": int(unitData.get("max_soc", 0)),
                },
                forecaster=forecaster_for_type(cfg.index, unitData, cfg.forecasts),
            )
    return world


def _only_hours(s: str) -> OnlyHours | None:
    if s is None or s == "" or len(s.split(",")) != 2:
        return None
    return OnlyHours(int(s.split(",")[0]), int(s.split(",")[1]))


def _optional_string(s: str) -> str | None:
    if s is None or s == "" or s.lower() == "none":
        return None
    return s
