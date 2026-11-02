export default function Footer() {
  const footerClasses = 'p-2 m-1 text-xs rounded-md hover:bg-gray-300';
  return (
    <footer className="p-1 flex justify-end items-center border-t-1 border-gray-300">
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
