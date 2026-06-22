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
from assume.strategies import bidding_strategies, deprecated_bidding_strategies
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
        strategy_class = bidding_strategies.get(
            strat, deprecated_bidding_strategies.get(strat)
        )
        if strategy_class is None:
            raise ValidationError(
                f"unknown bidding strategy {strat!r}", id=unit_id, field="strategy"
            )
        strategies[market_data["name"].str()] = strategy_class()
    residual_forecast = cfg.forecasts.get("residual_load", None)
    price_forecast = cfg.forecasts.get("price", None)
    if price_forecast is None:
        # TODO this is a weird default, maybe change it in assume itself
        price_forecast = {market_id: 50 for market_id in strategies.keys()}
    try:
        match data["unitType"].str():
            case "demand":
                price = data.optional("price").optional_float()
                price_kwargs = {} if price is None else {"price": price}
                return Demand(
                    id=data["name"].str(),
                    technology=data.optional("technology").optional_str(""),
                    unit_operator=unit_operator_id,
                    bidding_strategies=strategies,
                    max_power=data["max_power"].float(),
                    min_power=data.optional("min_power").optional_float(0.0),
                    forecaster=DemandForecaster(
                        index=cfg.index,
                        availability=data.optional(
                            "forecast_availability"
                        ).optional_file(cfg.index, 1),
                        demand=-abs(
                            data.optional("forecast_demand").optional_file(
                                cfg.index, -100
                            )
                        ),
                        market_prices=price_forecast,
                        residual_load=residual_forecast,
                    ),
                    **price_kwargs,
                )
            case "power_plant":
                return PowerPlant(
                    id=data["name"].str(),
                    technology=data.optional("technology").optional_str(""),
                    unit_operator=unit_operator_id,
                    bidding_strategies=strategies,
                    min_power=data.optional("min_power").optional_float(0.0),
                    max_power=data["max_power"].float(),
                    efficiency=data.optional("efficiency").optional_float(1.0),
                    ramp_up=data.optional("ramp_up").optional_float(),
                    ramp_down=data.optional("ramp_down").optional_float(),
                    emission_factor=data.optional("emission_factor").optional_float(
                        0.0
                    ),
                    min_operating_time=data.optional("min_operating_time").optional_int(
                        1
                    ),
                    min_down_time=data.optional("min_downtime").optional_int(1),
                    forecaster=PowerplantForecaster(
                        index=cfg.index,
                        availability=data.optional(
                            "forecast_availability"
                        ).optional_file(cfg.index, 1),
                        fuel_prices={
                            "co2": data.optional("forecast_co2_price").optional_file(
                                cfg.index, 0
                            ),
                            "others": data.optional(
                                "forecast_fuel_price"
                            ).optional_file(cfg.index, 0),
                        },
                        market_prices=price_forecast,
                        residual_load=residual_forecast,
                    ),
                )
            case "exchange":
                price_kwargs = {}
                for field in ("price_import", "price_export"):
                    price = data.optional(field).optional_float()
                    if price is not None:
                        price_kwargs[field] = price
                return Exchange(
                    id=data["name"].str(),
                    unit_operator=unit_operator_id,
                    bidding_strategies=strategies,
                    forecaster=ExchangeForecaster(
                        index=cfg.index,
                        availability=data.optional(
                            "forecast_availability"
                        ).optional_file(cfg.index, 1),
                        volume_export=data.optional(
                            "forecast_volume_export"
                        ).optional_file(cfg.index, 0),
                        volume_import=data.optional(
                            "forecast_volume_import"
                        ).optional_file(cfg.index, 0),
                        market_prices=price_forecast,
                        residual_load=residual_forecast,
                    ),
                    **price_kwargs,
                )
            case "storage":
                return Storage(
                    id=data["name"].str(),
                    unit_operator=unit_operator_id,
                    bidding_strategies=strategies,
                    technology=data.optional("technology").optional_str(""),
                    capacity=data["capacity"].float(),
                    max_power_charge=data["max_power_charge"].float(),
                    min_power_charge=data.optional("min_power_charge").optional_float(
                        0.0
                    ),
                    max_power_discharge=data["max_power_discharge"].float(),
                    min_power_discharge=data.optional(
                        "min_power_discharge"
                    ).optional_float(0.0),
                    max_soc=data.optional("max_soc").optional_float(1.0),
                    min_soc=data.optional("min_soc").optional_float(0.0),
                    forecaster=UnitForecaster(
                        index=cfg.index,
                        availability=data.optional(
                            "forecast_availability"
                        ).optional_file(cfg.index, 1),
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
