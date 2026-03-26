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
    const header_classes = "p-2 m-1 text-xl rounded-md hover:bg-gray-300 cursor-pointer";

    return (
        <header className="bg-gray p-2 color-black flex justify-between items-center border-b-1 border-gray-300">
            <a href="/"><img src="assume_logo.png" alt="ASSUME Logo" className="w-20" /></a>
            <nav>
                <ul>
                    <a className={header_classes} href={grafanaResultsHref} target="_blank" rel="noopener noreferrer">Results</a>
                    <button
                        type="button"
                        className={header_classes}
                        onClick={(e) => {
                            e.preventDefault();
                            onReinforcementLearning?.();
                        }}
                    >
                        Reinforcement Learning
                    </button>
                    <button
                        type="button"
                        className={header_classes}
                        onClick={(e) => {
                            e.preventDefault();
                            onDiscussSimulation?.();
                        }}
                    >
                        Discuss Simulation
                    </button>
                </ul>
            </nav>
        </header>
    );
}
