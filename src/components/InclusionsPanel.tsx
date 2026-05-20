import { useState } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { materialColor } from "../model/colors";
import type { Inclusion, ShapeType } from "../model/types";

interface Props {
  inclusions: Inclusion[];
  materials: string[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAdd: (shape: ShapeType) => void;
}

export function InclusionsPanel({ inclusions, materials, selectedId, onSelect, onAdd }: Props) {
  const [shape, setShape] = useState<ShapeType>("circle");

  return (
    <CollapsibleSection title="Inkluzje" defaultOpen>
      <div className="inclusion-list">
        {inclusions.map((inc) => (
          <button
            key={inc.id}
            className={inc.id === selectedId ? "inclusion-chip selected" : "inclusion-chip"}
            style={{ borderColor: materialColor(inc.material, materials), backgroundColor: materialColor(inc.material, materials) }}
            onClick={() => onSelect(inc.id)}
            type="button"
          >
            <span>{inc.id}</span>
            <small>{inc.shape} / {inc.material}</small>
          </button>
        ))}
      </div>
      <div className="add-inclusion-row">
        <button onClick={() => onAdd(shape)} type="button">+ inkluzja</button>
        <select value={shape} onChange={(e) => setShape(e.target.value as ShapeType)}>
          {["circle", "ellipse", "rectangle", "polygon"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
    </CollapsibleSection>
  );
}
