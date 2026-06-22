from datetime import timedelta

import dateutil.rrule as rr
from assume import MarketConfig, MarketProduct, World
from assume.common.base import BaseUnit
from assume.common.exceptions import ValidationError
from assume.common.forecaster import (
    DemandForecaster,
    ExchangeForecaster,
    PowerplantForecaster,
    UnitForecaster,
)
from assume.strategies import deprecated_bidding_strategies
from assume.units import Demand, Exchange, PowerPlant, Storage
from dateutil.relativedelta import relativedelta

from backend.config import Config, EdgeType
from backend.utils import DBURI

rrule_from_string = {
    "HOURLY": rr.HOURLY,
    "DAILY": rr.DAILY,
    "WEEKLY": rr.WEEKLY,
    "MONTHLY": rr.MONTHLY,
}


def process_data(input: dict):
    cfg = Config(input)
    worldcfg = cfg.get_node("world")

    world = World(database_uri=DBURI)
    world.setup(
        start=cfg.start,
        end=cfg.end,
        save_frequency_hours=worldcfg["save_frequency_hours"].int(),
        simulation_id=worldcfg["simulation_id"].str().strip(),
    )

    add_markets(world, cfg)
    add_units(world, cfg)
    return world


def add_units(world: World, cfg: Config):
    for operator_edge in cfg.get_edges("world", EdgeType.unit_operator):
        world.add_unit_operator(operator_edge.target)
        for unit_edge in cfg.get_edges(operator_edge.target, EdgeType.unit):
            world.add_unit_instance(
                operator_edge.target,
                instanciate_unit(cfg, unit_edge.target, operator_edge.target),
            )
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
                        duration=relativedelta(minutes=(productData["duration"].int())),
                        count=(productData["count"].int()),
                        first_delivery=relativedelta(
                            minutes=(productData["first_delivery"].int())
                        ),
                        only_hours=productData["only_hours"].only_hours(),
                        eligible_lambda_function=productData[
                            "eligible_lambda_function"
                        ].optional_str(),
                    )
                )
            data = cfg.get_node(market_edge.target)
            market_config = MarketConfig(
                market_id=data["name"].str(),
                market_mechanism=data["market_mechanism"].str(),
                opening_hours=rr.rrule(
                    freq=rrule_from_string[data["opening_hours"].str()],
                    interval=1,
                    dtstart=cfg.start,
                    until=cfg.end,
                ),
                opening_duration=timedelta(minutes=data["opening_duration"].int()),
                market_products=market_products,
                product_type=data["product_type"].str(),
                maximum_bid_volume=data["maximum_bid_volume"].float(),
                maximum_bid_price=data["maximum_bid_price"].float(),
                minimum_bid_price=data["minimum_bid_price"].float(),
                additional_fields=data["additional_fields"].comma_array(),
                volume_unit=data["volume_unit"].str(),
                volume_tick=data["volume_tick"].optional_float(),
                price_unit=data["price_unit"].str(),
                price_tick=data["price_tick"].optional_float(),
                # supports_get_unmatched=data["supports_get_unmatched"], # TODO
            )
            world.add_market(
                market_operator_id=operator_edge.target,
                market_config=market_config,
            )


def instanciate_unit(
    cfg: Config,
    unit_id: str,
    unit_operator_id: str,
) -> BaseUnit:
    data = cfg.get_node(unit_id)
    # get bidding strategies for each market
    strategies = {}
    for connection in cfg.get_edge_targets(unit_id, EdgeType.market):
        market_data = cfg.get_node(connection.source)
        strat = connection["strategy"]
        strategies[market_data["name"].str()] = deprecated_bidding_strategies[strat]()
    residual_forecast = cfg.forecasts.get("residual_load", None)
    price_forecast = cfg.forecasts.get("price", None)
    if price_forecast is None:
        # TODO this is a weird default, maybe change it in assume itself
        price_forecast = {market_id: 50 for market_id in strategies.keys()}
    try:
        match data["unitType"].str():
            case "demand":
                return Demand(
                    id=data["name"].str(),
                    technology=data["technology"].optional_str(""),
                    unit_operator=unit_operator_id,
                    bidding_strategies=strategies,
                    price=data["price"].float(),
                    max_power=data["max_power"].float(),
                    min_power=data["min_power"].float(),
                    forecaster=DemandForecaster(
                        index=cfg.index,
                        availability=data["forecast_availability"].optional_file(
                            cfg.index
                        ),
                        demand=-abs(data["forecast_demand"].optional_file(cfg.index)),
                        market_prices=price_forecast,
                        residual_load=residual_forecast,
                    ),
                )
            case "power_plant":
                return PowerPlant(
                    id=data["name"].str(),
                    technology=data["technology"].optional_str(""),
                    unit_operator=unit_operator_id,
                    bidding_strategies=strategies,
                    min_power=data["min_power"].float(),
                    max_power=data["max_power"].float(),
                    efficiency=data["efficiency"].float(),
                    ramp_up=data["ramp_up"].float(),
                    ramp_down=data["ramp_down"].float(),
                    emission_factor=data["emission_factor"].float(),
                    min_operating_time=data["min_operating_time"].int(),
                    min_down_time=data["min_downtime"].int(),
                    forecaster=PowerplantForecaster(
                        index=cfg.index,
                        availability=data["forecast_availability"].optional_file(
                            cfg.index
                        ),
                        fuel_prices={
                            "co2": data["forecast_co2_price"].optional_file(cfg.index),
                            "others": data["forecast_fuel_price"].optional_file(
                                cfg.index
                            ),
                        },
                        market_prices=price_forecast,
                        residual_load=residual_forecast,
                    ),
                )
            case "exchange":
                return Exchange(
                    id=data["name"].str(),
                    unit_operator=unit_operator_id,
                    bidding_strategies=strategies,
                    technology=data["technology"].optional_str(""),
                    price_import=data["price_import"].float(),
                    price_export=data["price_export"].float(),
                    forecaster=ExchangeForecaster(
                        index=cfg.index,
                        availability=data["forecast_availability"].optional_file(
                            cfg.index
                        ),
                        volume_export=data["forecast_volume_export"].optional_file(
                            cfg.index
                        ),
                        volume_import=data["forecast_volume_import"].optional_file(
                            cfg.index
                        ),
                        market_prices=price_forecast,
                        residual_load=residual_forecast,
                    ),
                )
            case "storage":
                return Storage(
                    id=data["name"].str(),
                    unit_operator=unit_operator_id,
                    bidding_strategies=strategies,
                    technology=data["technology"].optional_str(""),
                    capacity=data["capacity"].float(),
                    max_power_charge=data["max_power_charge"].float(),
                    min_power_charge=data["min_power_charge"].float(),
                    max_power_discharge=data["max_power_discharge"].float(),
                    min_power_discharge=data["min_power_discharge"].float(),
                    max_soc=data["max_soc"].float(),
                    min_soc=data["min_soc"].float(),
                    forecaster=UnitForecaster(
                        index=cfg.index,
                        availability=data["forecast_availability"].optional_file(
                            cfg.index
                        ),
                        market_prices=price_forecast,
                        residual_load=residual_forecast,
                    ),
                )
    except ValidationError as e:
        # make sure we reference the correct unit here
        e.id = unit_id
        raise e
    raise NotImplementedError(
        f"Forecaster for unit type {data['unitType']} is not implemented."
    )
