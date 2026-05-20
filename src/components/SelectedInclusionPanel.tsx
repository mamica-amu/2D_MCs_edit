import type { Inclusion, ShapeType } from "../model/types";

interface Props {
  inclusion?: Inclusion;
  materials: string[];
  onChange: (id: string, patch: Partial<Inclusion>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function SelectedInclusionPanel({ inclusion, materials, onChange, onDelete, onDuplicate }: Props) {
  if (!inclusion) {
    return (
      <section className="panel selected-panel">
        <h2>Wybrana inkluzja</h2>
        <p>Kliknij inkluzję na rysunku, aby edytować jej parametry.</p>
      </section>
    );
  }

  const set = (patch: Partial<Inclusion>) => onChange(inclusion.id, patch);

  return (
    <section className="panel selected-panel">
      <div className="panel-title compact">
        <h2>Wybrana inkluzja</h2>
        <strong>{inclusion.id}</strong>
      </div>
      <div className="selected-grid">
        <label>id<input value={inclusion.id} onChange={(e) => set({ id: e.target.value })} /></label>
        <label>materiał<select value={inclusion.material} onChange={(e) => set({ material: e.target.value })}>{materials.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label>kształt<select value={inclusion.shape} onChange={(e) => set({ shape: e.target.value as ShapeType })}>{["circle", "ellipse", "rectangle", "polygon"].map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>priority<input type="number" value={inclusion.priority} onChange={(e) => set({ priority: Number(e.target.value) })} /></label>
        <div className="double wide">center_frac
          <input type="number" value={inclusion.center_frac[0]} onChange={(e) => set({ center_frac: [Number(e.target.value), inclusion.center_frac[1]] })} />
          <input type="number" value={inclusion.center_frac[1]} onChange={(e) => set({ center_frac: [inclusion.center_frac[0], Number(e.target.value)] })} />
        </div>
        <div className="double wide">center [m]
          <input type="number" value={inclusion.center[0]} onChange={(e) => set({ center: [Number(e.target.value), inclusion.center[1]] })} />
          <input type="number" value={inclusion.center[1]} onChange={(e) => set({ center: [inclusion.center[0], Number(e.target.value)] })} />
        </div>
        {inclusion.shape === "circle" && <label>radius [m]<input type="number" value={inclusion.radius ?? ""} onChange={(e) => set({ radius: Number(e.target.value) })} /></label>}
        {inclusion.shape === "ellipse" && <>
          <label>rx [m]<input type="number" value={inclusion.rx ?? ""} onChange={(e) => set({ rx: Number(e.target.value) })} /></label>
          <label>ry [m]<input type="number" value={inclusion.ry ?? ""} onChange={(e) => set({ ry: Number(e.target.value) })} /></label>
        </>}
        {inclusion.shape === "rectangle" && <>
          <label>wx [m]<input type="number" value={inclusion.wx ?? ""} onChange={(e) => set({ wx: Number(e.target.value) })} /></label>
          <label>wy [m]<input type="number" value={inclusion.wy ?? ""} onChange={(e) => set({ wy: Number(e.target.value) })} /></label>
        </>}
        <label>rotation [deg]<input type="number" value={inclusion.rotation_deg ?? 0} onChange={(e) => set({ rotation_deg: Number(e.target.value) })} /></label>
        <label>fil_frac<input type="number" value={inclusion.fil_frac} onChange={(e) => set({ fil_frac: Number(e.target.value) })} /></label>
      </div>
      <div className="button-grid">
        <button onClick={() => onDuplicate(inclusion.id)}>Duplikuj</button>
        <button className="danger" onClick={() => onDelete(inclusion.id)}>Usuń</button>
      </div>
    </section>
  );
}
