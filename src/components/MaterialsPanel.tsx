import type { Material } from "../model/types";

export function MaterialsPanel({ materials, onChange }: { materials: Record<string, Material>; onChange: (next: Record<string, Material>) => void }) {
  const update = (name: string, key: keyof Material, value: number) => onChange({ ...materials, [name]: { ...materials[name], [key]: value } });
  return (
    <section className="form-section">
      <h3>Materials</h3>
      {Object.entries(materials).map(([name, mat]) => (
        <details key={name} open={name === "Py"}>
          <summary>{name}</summary>
          {(["Ms", "Aex", "Lex", "alpha", "Ku1", "Dind"] as (keyof Material)[]).map((key) => (
            <label key={key}>{key}<input type="number" value={(mat[key] as number | undefined) ?? ""} onChange={(e) => update(name, key, Number(e.target.value))} /></label>
          ))}
        </details>
      ))}
    </section>
  );
}
