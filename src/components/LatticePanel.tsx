import type { ChangeEvent } from "react";
import type { Lattice2D } from "../model/types";

interface Props {
  lattice: Lattice2D;
  onChange: (patch: Partial<Lattice2D>) => void;
}

export function LatticePanel({ lattice, onChange }: Props) {
  const num = (key: keyof Lattice2D) => (e: ChangeEvent<HTMLInputElement>) => onChange({ [key]: Number(e.target.value) } as Partial<Lattice2D>);
  return (
    <section className="form-section">
      <h3>Lattice</h3>
      <label>Typ<select value={lattice.type} onChange={(e) => onChange({ type: e.target.value as Lattice2D["type"] })}>
        {["square", "rectangular", "hexagonal", "oblique", "custom"].map((x) => <option key={x}>{x}</option>)}
      </select></label>
      <label>a [m]<input type="number" value={lattice.a} onChange={num("a")} /></label>
      <label>b [m]<input type="number" value={lattice.b} onChange={num("b")} /></label>
      <label>kąt [deg]<input type="number" value={lattice.cell_angle_deg} onChange={num("cell_angle_deg")} /></label>
      <label>obrót [deg]<input type="number" value={lattice.rotation_deg} onChange={num("rotation_deg")} /></label>
      <label>sx<input type="number" value={lattice.sx} onChange={num("sx")} /></label>
      <label>sy<input type="number" value={lattice.sy} onChange={num("sy")} /></label>
      <label>compression_frame<select value={lattice.compression_frame} onChange={(e) => onChange({ compression_frame: e.target.value as Lattice2D["compression_frame"] })}>
        <option>lattice</option><option>lab</option>
      </select></label>
    </section>
  );
}
