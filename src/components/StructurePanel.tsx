import type { Structure2D } from "../model/types";

export function StructurePanel({ structure, materials, onChange }: { structure: Structure2D; materials: string[]; onChange: (patch: Partial<Structure2D>) => void }) {
  return (
    <section className="form-section">
      <h3>Structure</h3>
      <label>grubość [m]<input type="number" value={structure.thickness} onChange={(e) => onChange({ thickness: Number(e.target.value) })} /></label>
      <label>matryca<select value={structure.host_material} onChange={(e) => onChange({ host_material: e.target.value })}>
        {materials.map((m) => <option key={m}>{m}</option>)}
      </select></label>
      <p>total_fil_frac: {(structure.filling?.total_fil_frac ?? 0).toPrecision(5)}</p>
    </section>
  );
}
