export default function Header({
  onDiscussSimulation,
  onReinforcementLearning,
  grafanaResultsHref = '/grafana',
}: {
  onDiscussSimulation?: () => void;
  onReinforcementLearning?: () => void;
  // World time range for Grafana, e.g. `/grafana/?from=...&to=...`
  grafanaResultsHref?: string;
} = {}) {
  const headerClasses = 'p-2 m-1 text-xl rounded-md hover:bg-gray-300 cursor-pointer';

  return (
    <header className="p-2 flex justify-between items-center border-b-1 border-gray-300">
      <a href="/">
        <img src="/assume_logo.png" alt="ASSUME Logo" className="w-20" />
      </a>
      <nav>
        <ul className="flex items-center">
          <li>
            <a
              className={headerClasses}
              href={grafanaResultsHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Results
            </a>
          </li>
          <li>
            <button type="button" className={headerClasses} onClick={onReinforcementLearning}>
              Reinforcement Learning
            </button>
          </li>
          <li>
            <button type="button" className={headerClasses} onClick={onDiscussSimulation}>
              Discuss Simulation
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
