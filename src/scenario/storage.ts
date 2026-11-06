import { createInitialScenario } from './model';
import { parseScenarioFile } from './serialization';
import type { Scenario } from './types';

export const STORAGE_KEY = 'flow';

/** The saved scenario, or a fresh one if nothing (valid) was saved. */
export const loadScenario = (): Scenario => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return createInitialScenario();
  }
  try {
    return parseScenarioFile(saved);
  } catch (e) {
    console.warn('Discarding unreadable saved flow', e);
    localStorage.removeItem(STORAGE_KEY);
    return createInitialScenario();
  }
};
