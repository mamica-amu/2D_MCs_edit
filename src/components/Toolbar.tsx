import squareExample from "../examples/square_two_inclusions.toml?raw";
import hexExample from "../examples/hexagonal_antidot.toml?raw";

interface Props {
  onNew: () => void;
  onLoadText: (text: string) => void;
  onSave: () => void;
  onValidate: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
}

export function Toolbar({ onNew, onLoadText, onSave, onValidate, onExportSvg, onExportPng }: Props) {
  const loadFile = async (file?: File) => {
    if (file) onLoadText(await file.text());
  };
  return (
    <header className="toolbar">
      <strong>2D MCs Edit</strong>
      <button onClick={onNew}>New</button>
      <label className="file-button">Load TOML<input type="file" accept=".toml,text/plain" onChange={(e) => loadFile(e.target.files?.[0])} /></label>
      <button onClick={onSave}>Save TOML</button>
      <select onChange={(e) => e.target.value && onLoadText(e.target.value)} defaultValue="">
        <option value="" disabled>Load Example</option>
        <option value={squareExample}>Square: 2 inkluzje</option>
        <option value={hexExample}>Hexagonal antidot</option>
      </select>
      <button onClick={onValidate}>Validate</button>
      <button onClick={onExportSvg}>Export SVG</button>
      <button onClick={onExportPng}>Export PNG</button>
    </header>
  );
}
