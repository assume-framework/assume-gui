import type { ConfigData } from './scenario/types';

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

export function handleChange(
  id: string,
  data: ConfigData,
  updateNodeValue: (id: string, data: ConfigData, isEdge: boolean) => void,
  isEdge: boolean = false
) {
  return (key: string) => (value: string) => {
    const d = { ...data };
    d[key] = value;
    updateNodeValue(id, d, isEdge);
  };
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

export function initialWorld(): ConfigData {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return {
    name: 'World Node',
    start: formatDatetimeLocalMidnight(start),
    end: formatDatetimeLocalMidnight(end),
    save_frequency: '',
    simulation_id: '',
    frequency: '',
  };
}

const marketData = {
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
};

const marketProductData = {
  duration: '',
  count: '',
  first_delivery: '',
  only_hours: '',
  eligible_lambda_function: '',
};

const demandData = {
  unitType: 'demand',
  technology: '',
  max_power: '0',
  min_power: '0',
  price: '3000',
  forecast_availability: '1',
  forecast_demand: '-100',
};

const storageData = {
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
};

const powerPlantData = {
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
};

const exchangeData = {
  unitType: 'exchange',
  technology: '',
  price_import: '0.0',
  price_export: '2999.0',
  forecast_availability: '1',
  forecast_volume_import: '0',
  forecast_volume_export: '0',
};

export function initialData(type: string): ConfigData {
  let data = {};
  switch (type) {
    case 'market':
      data = marketData;
      break;
    case 'marketProduct':
      data = marketProductData;
      break;
    case 'demand':
      data = demandData;
      break;
    case 'storage':
      data = storageData;
      break;
    case 'power_plant':
      data = powerPlantData;
      break;
    case 'exchange':
      data = exchangeData;
      break;
    case 'unit-market':
      data = { strategy: '' };
      break;
  }
  return {
    name: getName(type),
    ...data,
  };
}
