export default function Footer() {
  const footerClasses = 'px-2 py-0.5 mx-1 text-xs rounded hover:bg-gray-300';
  return (
    <footer className="py-0.5 px-1 flex justify-end items-center border-t-1 border-gray-300">
      <a
        className={footerClasses}
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/assume-framework/assume-gui"
      >
        ASSUME GUI
      </a>
      <a className={footerClasses} target="_blank" rel="noopener noreferrer" href="/imprint">
        Impressum & Datenschutz
      </a>
      <a className={footerClasses} target="_blank" rel="noopener noreferrer" href="/accessibility">
        Barrierefreiheitserklärung
      </a>
    </footer>
  );
}
