export default function Header() {
    const header_classes = "p-2 m-1 text-xl rounded-md hover:bg-gray-300";
    
    return (
        <header className="bg-gray p-2 color-black flex justify-between items-center border-b-1 border-gray-300">
            <a href="/"><img src="assume_logo.png" alt="ASSUME Logo" className="w-20" /></a>
            <nav>
                <ul>
                    <a className={header_classes} href="/grafana">Results</a>
                    <a className={header_classes} href="/rl_params">Reinforcement Learning</a>
                    <a className={header_classes} href="/ai">Discuss Simulation</a>
                    <a className={header_classes} href="https://github.com/assume-framework/assume-gui">Repository</a>
                </ul>
            </nav>
        </header>
    );
}