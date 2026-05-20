interface Props {
  text: string;
  parseError?: string;
  onChange: (text: string) => void;
  onApply: () => void;
}

export function TomlEditor({ text, parseError, onChange, onApply }: Props) {
  return (
    <section className="panel toml-panel">
      <div className="panel-title">
        <h2>Edytor TOML</h2>
        <button onClick={onApply}>Zastosuj TOML</button>
      </div>
      {parseError && <p className="error-box">{parseError}</p>}
      <textarea value={text} spellCheck={false} onChange={(e) => onChange(e.target.value)} />
    </section>
  );
}
