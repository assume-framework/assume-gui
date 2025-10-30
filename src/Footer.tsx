export default function Footer() {
    const footer_classes = "p-2 m-1 text-xs rounded-md hover:bg-gray-300";
    return (
        <footer className="bg-gray p-1 color-black float-right flex justify-end items-center border-t-1 border-gray-300">
            <p className="p-2 m-1 text-xs">ASSUME GUI</p>
            <a className={footer_classes} href="/imprint">Impressum & Datenschutz</a>
            <a className={footer_classes} href="/accessibility">Barrierefreiheitserklärung</a>
        </footer>
    );
}