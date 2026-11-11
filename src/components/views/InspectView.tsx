import { useMemo } from 'react';
import { buildGrafanaResultsHref } from '../../api/grafana';
import { useScenario } from '../../scenario/context';
import { WORLD_ID } from '../../scenario/model';

export default function InspectView() {
  const { config } = useScenario();

  // World time range and simulation id, e.g. `/grafana/?var-simulation=...&from=...&to=...`
  const grafanaResultsHref = useMemo(() => {
    const world = config.nodes[WORLD_ID];
    if (!world) return '/grafana';
    return buildGrafanaResultsHref(world.data.start, world.data.end, world.data.simulation_id);
  }, [config]);

  return (
    <main className="min-h-0 grow px-8 py-6">
      <a
        className="text-lg text-emerald-700 underline hover:text-emerald-900"
        href={grafanaResultsHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        Results
      </a>
    </main>
  );
}
