import type { Inclusion, ShapeType } from "../model/types";

interface Props {
  inclusions: Inclusion[];
  materials: string[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<Inclusion>) => void;
  onAdd: (shape: ShapeType) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function InclusionsPanel({ inclusions, materials, selectedId, onSelect, onChange, onAdd, onDelete, onDuplicate }: Props) {
  const selected = inclusions.find((inc) => inc.id === selectedId) ?? inclusions[0];
  const set = (patch: Partial<Inclusion>) => selected && onChange(selected.id, patch);
  return (
    <section className="form-section">
      <h3>Inclusions</h3>
      <div className="button-grid">
        <button onClick={() => onAdd("circle")}>+ koło</button>
        <button onClick={() => onAdd("rectangle")}>+ prostokąt</button>
        <button onClick={() => onAdd("polygon")}>+ polygon</button>
      </div>
      <select value={selected?.id ?? ""} onChange={(e) => onSelect(e.target.value)}>
        {inclusions.map((inc) => <option key={inc.id}>{inc.id}</option>)}
      </select>
      {selected && (
        <div className="inclusion-edit">
          <label>id<input value={selected.id} onChange={(e) => set({ id: e.target.value })} /></label>
          <label>materiał<select value={selected.material} onChange={(e) => set({ material: e.target.value })}>{materials.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label>shape<select value={selected.shape} onChange={(e) => set({ shape: e.target.value as ShapeType })}>
            {["circle", "ellipse", "rectangle", "polygon"].map((s) => <option key={s}>{s}</option>)}
          </select></label>
          <div className="double">center_frac
            <input type="number" value={selected.center_frac[0]} onChange={(e) => set({ center_frac: [Number(e.target.value), selected.center_frac[1]] })} />
            <input type="number" value={selected.center_frac[1]} onChange={(e) => set({ center_frac: [selected.center_frac[0], Number(e.target.value)] })} />
          </div>
          {selected.shape === "circle" && <label>radius [m]<input type="number" value={selected.radius ?? ""} onChange={(e) => set({ radius: Number(e.target.value) })} /></label>}
          {selected.shape === "ellipse" && <><label>rx [m]<input type="number" value={selected.rx ?? ""} onChange={(e) => set({ rx: Number(e.target.value) })} /></label><label>ry [m]<input type="number" value={selected.ry ?? ""} onChange={(e) => set({ ry: Number(e.target.value) })} /></label></>}
          {selected.shape === "rectangle" && <><label>wx [m]<input type="number" value={selected.wx ?? ""} onChange={(e) => set({ wx: Number(e.target.value) })} /></label><label>wy [m]<input type="number" value={selected.wy ?? ""} onChange={(e) => set({ wy: Number(e.target.value) })} /></label></>}
          <label>rotation [deg]<input type="number" value={selected.rotation_deg ?? 0} onChange={(e) => set({ rotation_deg: Number(e.target.value) })} /></label>
          <label>fil_frac<input type="number" value={selected.fil_frac} onChange={(e) => set({ fil_frac: Number(e.target.value) })} /></label>
          <label>priority<input type="number" value={selected.priority} onChange={(e) => set({ priority: Number(e.target.value) })} /></label>
          <div className="button-grid">
            <button onClick={() => onDuplicate(selected.id)}>Duplikuj</button>
            <button className="danger" onClick={() => onDelete(selected.id)}>Usuń</button>
          </div>
        </div>
      )}
    </section>
  );
}
