export default function Footer() {
    const footer_classes = "p-2 m-1 text-xs rounded-md hover:bg-gray-300";
    return (
        <footer className="bg-gray p-1 color-black float-right flex justify-end items-center border-t-1 border-gray-300">
            <a className={footer_classes} target="_blank" rel="noopener noreferrer" href="https://github.com/assume-framework/assume-gui">ASSUME GUI</a>
            <a className={footer_classes} target="_blank" rel="noopener noreferrer" href="/imprint">Impressum & Datenschutz</a>
            <a className={footer_classes} target="_blank" rel="noopener noreferrer" href="/accessibility">Barrierefreiheitserklärung</a>
        </footer>
    );
}
