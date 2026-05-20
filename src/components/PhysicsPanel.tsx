import type { Physics } from "../model/types";

export function PhysicsPanel({ physics, onChange }: { physics: Physics; onChange: (patch: Partial<Physics>) => void }) {
  const vec = (key: "H0_dir" | "m_eq", index: number, value: number) => {
    const next = [...(physics[key] ?? [0, 0, 1])] as [number, number, number];
    next[index] = value;
    onChange({ [key]: next } as Partial<Physics>);
  };
  return (
    <section className="form-section">
      <h3>Physics</h3>
      <label>gamma<input type="number" value={physics.gamma} onChange={(e) => onChange({ gamma: Number(e.target.value) })} /></label>
      <label>mu0<input type="number" value={physics.mu0} onChange={(e) => onChange({ mu0: Number(e.target.value) })} /></label>
      <label>H0 [T]<input type="number" value={physics.H0} onChange={(e) => onChange({ H0: Number(e.target.value) })} /></label>
      <div className="triple">H0_dir {physics.H0_dir.map((v, i) => <input key={i} type="number" value={v} onChange={(e) => vec("H0_dir", i, Number(e.target.value))} />)}</div>
      <div className="triple">m_eq {(physics.m_eq ?? [0, 0, 1]).map((v, i) => <input key={i} type="number" value={v} onChange={(e) => vec("m_eq", i, Number(e.target.value))} />)}</div>
      <label>demag<input value={physics.demag} onChange={(e) => onChange({ demag: e.target.value })} /></label>
      <label>equilibrium<input value={physics.equilibrium} onChange={(e) => onChange({ equilibrium: e.target.value })} /></label>
    </section>
  );
}
