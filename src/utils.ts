import type {EditSidebarData} from "./ui/SidebarComponents/NodeEditSidebar.tsx";

/** Parse world `datetime-local` strings as local wall time. */
export function parseWorldDatetimeLocal(value: string): Date | null {
    const s = value.trim();
    if (!s) return null;
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (dateOnly) {
        const d = new Date(
            Number(dateOnly[1]),
            Number(dateOnly[2]) - 1,
            Number(dateOnly[3]),
            0,
            0,
            0,
            0
        );
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{1,2}):(\d{2})/.exec(s);
    if (!m) return null;
    const d = new Date(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        Number(m[4]),
        Number(m[5]),
        0,
        0
    );
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * `/grafana` proxy URL with `from` / `to` as UTC ISO strings (Grafana-style), from world start/end.
 * Falls back to `/grafana` if either value is missing or invalid.
 */
export function buildGrafanaResultsHref(start: string, end: string, simulation_id: string): string {
    const fromDate = parseWorldDatetimeLocal(start);
    const toDate = parseWorldDatetimeLocal(end);
    if (!fromDate || !toDate) return '/grafana';
    const params = new URLSearchParams({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        'var-simulation': simulation_id,
    });
    return `/grafana/?${params.toString()}`;
}

export function handleChange(id: string, data: EditSidebarData, updateNodeValue: (id: string, data: EditSidebarData, isEdge: boolean) => void, isEdge: boolean = false) {
    return (key: string) => (value: string) => {
        const d = {...data}
        d[key] = value
        updateNodeValue(id, d, isEdge);
    }
}

let id = 1;
export const getId = (type: string) => `${type}_${crypto.randomUUID()}`;
export const getName = (type: string) => `${type}_${id++}`;

function formatDatetimeLocalMidnight(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}T00:00`;
}

export function initial_world(): EditSidebarData {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return {
        name: 'World Node',
        errorField: '',
        errorMessage: '',
        start: formatDatetimeLocalMidnight(start),
        end: formatDatetimeLocalMidnight(end),
        save_frequency: '',
        simulation_id: '',
        frequency: ''
    }
}

const market_data = {
    product_type: 'energy',
    maximum_bid_volume: '2000.0',
    maximum_bid_price: '3000.0',
    minimum_bid_price: '-500.0',
    volume_unit: 'MW',
    volume_tick: '',
    price_unit: '€/MWh',
    price_tick: '',
    additional_fields: '',
    opening_hours: '',
    opening_duration: '',
    market_mechanism: '',
}

const market_product_data = {
    duration: '',
    count: '',
    first_delivery: '',
    only_hours: '',
    eligible_lambda_function: '',
}

const demand_data = {
    unitType: 'demand',
    technology: '',
    max_power: '0',
    min_power: '0',
    price: '3000',
    forecast_availability: '1',
    forecast_demand: '-100',
}

const storage_data = {
    unitType: 'storage',
    technology: '',
    capacity: '',
    max_power_charge: '',
    max_power_discharge: '',
    max_soc: '1',
    min_power_charge: '0',
    min_power_discharge: '0',
    min_soc: '0',
    initial_soc: '0',
    forecast_availability: '1',
}

const power_plant_data = {
    unitType: 'power_plant',
    technology: '',
    max_power: '',
    min_power: '0',
    emission_factor: '0',
    efficiency: '1',
    ramp_down: '0',
    ramp_up: '0',
    min_operating_time: '1',
    min_downtime: '1',
    forecast_availability: '1',
    forecast_fuel_price: '10',
    forecast_co2_price: '10',
}

const exchange_data = {
    unitType: 'exchange',
    technology: '',
    price_import: '0.0',
    price_export: '2999.0',
    forecast_availability : '1',
    forecast_volume_import : '0',
    forecast_volume_export : '0',
}

export function initial_data(type: string): EditSidebarData {
    let data = {}
    switch (type) {
        case 'market':
            data = market_data
            break
        case 'marketProduct':
            data = market_product_data
            break
        case 'demand':
            data = demand_data
            break
        case 'storage':
            data = storage_data
            break
        case 'power_plant':
            data = power_plant_data
            break
        case 'exchange':
            data = exchange_data
            break
    }
    return {
        name: getName(type),
        errorField: '',
        errorMessage: '',
        ...data
    }
}
