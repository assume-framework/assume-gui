export const UNIT_MARKET_STRATEGIES = [
  { value: 'naive_eom', label: 'Naive EOM' },
  { value: 'naive_dam', label: 'Naive DAM' },
  { value: 'naive_pos_reserve', label: 'Naive Pos Reserve' },
  { value: 'naive_neg_reserve', label: 'Naive Neg Reserve' },
  { value: 'naive_exchange', label: 'Naive Exchange' },
  { value: 'elastic_demand', label: 'Elastic Demand' },
  { value: 'otc_strategy', label: 'OTC Strategy' },
  { value: 'flexable_eom', label: 'Flexable EOM' },
  { value: 'flexable_eom_block', label: 'Flexable EOM Block' },
  { value: 'flexable_eom_linked', label: 'Flexable EOM Linked' },
  { value: 'flexable_neg_crm', label: 'Flexable Neg CRM' },
  { value: 'flexable_pos_crm', label: 'Flexable Pos CRM' },
  { value: 'flexable_eom_storage', label: 'Flexable EOM Storage' },
  { value: 'flexable_neg_crm_storage', label: 'Flexable Neg CRM Storage' },
  { value: 'flexable_pos_crm_storage', label: 'Flexable Pos CRM Storage' },
  { value: 'pos_crm_dsm', label: 'Pos CRM DSM' },
  { value: 'neg_crm_dsm', label: 'Neg CRM DSM' },
  { value: 'naive_redispatch', label: 'Naive Redispatch' },
  { value: 'naive_da_dsm', label: 'Naive DA DSM' },
  { value: 'naive_redispatch_dsm', label: 'Naive Redispatch DSM' },
  { value: 'manual_strategy', label: 'Manual Strategy' },
  { value: 'dmas_powerplant', label: 'DMAS Powerplant' },
  { value: 'dmas_storage', label: 'DMAS Storage' },
  { value: 'cournot_portfolio', label: 'Cournot Portfolio' },
  { value: 'default_portfolio', label: 'Default Portfolio' },
] as const;

export const UNIT_MARKET_STRATEGY_LABELS: Record<string, string> = Object.fromEntries(
  UNIT_MARKET_STRATEGIES.map((strategy) => [strategy.value, strategy.label])
);
