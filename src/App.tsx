import { useEffect, useMemo, useState } from "react";
import { EditorLayout } from "./components/EditorLayout";
import { InclusionsPanel } from "./components/InclusionsPanel";
import { LatticePanel } from "./components/LatticePanel";
import { MaterialsPanel } from "./components/MaterialsPanel";
import { PhysicsPanel } from "./components/PhysicsPanel";
import { StructurePanel } from "./components/StructurePanel";
import { SelectedInclusionPanel } from "./components/SelectedInclusionPanel";
import { Toolbar } from "./components/Toolbar";
import { TomlEditor } from "./components/TomlEditor";
import { ValidationPanel } from "./components/ValidationPanel";
import { Visualization2D } from "./components/Visualization2D";
import { defaultMC2D } from "./model/defaults";
import { convertInclusionShape, degToRad, fracToCartesian, inclusionFillFraction, normalizeInclusion, normalizeLattice, normalizeMC2D, resizeInclusionToFillFraction } from "./model/geometry";
import { exportToml, parseToml } from "./model/toml";
import type { Inclusion, MC2D, ShapeType, Vec2 } from "./model/types";
import { validateMC2D } from "./model/validation";
import "./styles/app.css";

function recalc(next: MC2D, preserveFillIds = new Set<string>()): MC2D {
  const lattice = normalizeLattice(next.lattice);
  const inclusions = next.inclusions.map((inc, i) => {
    const merged = normalizeInclusion({ ...inc, center: fracToCartesian(inc.center_frac, lattice), rotation_rad: inc.rotation_deg === undefined ? inc.rotation_rad : degToRad(inc.rotation_deg) }, lattice, i + 1);
    return { ...merged, fil_frac: preserveFillIds.has(inc.id) ? merged.fil_frac : inclusionFillFraction(merged, lattice) };
  });
  const byMaterial: Record<string, number> = {};
  for (const inc of inclusions) byMaterial[inc.material] = (byMaterial[inc.material] ?? 0) + inc.fil_frac;
  return normalizeMC2D({ ...next, lattice, inclusions, structure: { ...next.structure, filling: { total_fil_frac: inclusions.reduce((s, i) => s + i.fil_frac, 0), by_material: byMaterial } } });
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function cloneSvgForExport(): SVGSVGElement | undefined {
  const svg = document.querySelector<SVGSVGElement>("#mc-svg");
  if (!svg) return undefined;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const viewBox = svg.getAttribute("viewBox");
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("preserveAspectRatio", "xMidYMid meet");
  if (viewBox) {
    const [, , width, height] = viewBox.split(/\s+/).map(Number);
    clone.setAttribute("viewBox", viewBox);
    clone.setAttribute("width", String(Math.max(1, Math.round(width))));
    clone.setAttribute("height", String(Math.max(1, Math.round(height))));
  }
  return clone;
}

export default function App() {
  const [mc, setMc] = useState<MC2D>(() => recalc(defaultMC2D));
  const [tomlText, setTomlText] = useState(() => exportToml(recalc(defaultMC2D)));
  const [parseError, setParseError] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>(mc.inclusions[0]?.id);
  const [repeat, setRepeat] = useState(1);
  const [showAxes, setShowAxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [highlightCenter, setHighlightCenter] = useState(true);
  const messages = useMemo(() => validateMC2D(mc), [mc]);
  const selectedInclusion = useMemo(() => mc.inclusions.find((inc) => inc.id === selectedId), [mc.inclusions, selectedId]);

  useEffect(() => setTomlText(exportToml(mc)), [mc]);

  useEffect(() => {
    const stopNumberWheel = (event: WheelEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === "number") {
        target.blur();
      }
    };
    document.addEventListener("wheel", stopNumberWheel, { capture: true });
    return () => document.removeEventListener("wheel", stopNumberWheel, { capture: true });
  }, []);

  const update = (producer: (current: MC2D) => MC2D, preserveFillIds = new Set<string>()) => {
    setMc((current) => recalc(producer(current), preserveFillIds));
  };

  const applyToml = (text = tomlText) => {
    try {
      const parsed = parseToml(text);
      setMc(recalc(parsed));
      setSelectedId(parsed.inclusions[0]?.id);
      setParseError(undefined);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : String(error));
    }
  };

  const changeInclusion = (id: string, patch: Partial<Inclusion>) => {
    if (patch.id) setSelectedId(patch.id);
    const preserveFillIds = patch.fil_frac === undefined ? new Set<string>() : new Set([id]);
    update((current) => {
      const lattice = normalizeLattice(current.lattice);
      return {
        ...current,
        inclusions: current.inclusions.map((inc) => {
          if (inc.id !== id) return inc;
          const merged = patch.shape && patch.shape !== inc.shape ? convertInclusionShape({ ...inc, ...patch }, lattice, patch.shape) : { ...inc, ...patch };
          return patch.fil_frac === undefined ? merged : resizeInclusionToFillFraction(merged, lattice, patch.fil_frac);
        })
      };
    }, preserveFillIds);
  };
  const addInclusion = (shape: ShapeType) => update((current) => {
    const id = `inc${current.inclusions.length + 1}`;
    const inc = normalizeInclusion({ id, shape, material: Object.keys(current.materials)[0], center_frac: [0.5, 0.5], radius: 45e-9, wx: 80e-9, wy: 60e-9, vertices: [[-40e-9, -30e-9], [40e-9, -30e-9], [0, 40e-9]] }, current.lattice, current.inclusions.length + 1);
    setSelectedId(id);
    return { ...current, inclusions: [...current.inclusions, inc] };
  });

  const exportSvg = () => {
    const svg = cloneSvgForExport();
    if (svg) download("mc2d-view.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml");
  };

  const exportPng = () => {
    const svg = cloneSvgForExport();
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
    image.onload = () => {
      const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number);
      const aspect = viewBox && viewBox[2] > 0 && viewBox[3] > 0 ? viewBox[2] / viewBox[3] : 1.4;
      const maxSide = 2400;
      const canvas = document.createElement("canvas");
      canvas.width = aspect >= 1 ? maxSide : Math.round(maxSide * aspect);
      canvas.height = aspect >= 1 ? Math.round(maxSide / aspect) : maxSide;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "mc2d-view.png";
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  return (
    <EditorLayout
      toolbar={<Toolbar onNew={() => setMc(recalc(defaultMC2D))} onLoadText={(text) => { setTomlText(text); applyToml(text); }} onSave={() => download("mc2d.toml", exportToml(mc), "text/plain")} onValidate={() => setParseError(undefined)} onExportSvg={exportSvg} onExportPng={exportPng} />}
      left={<><LatticePanel lattice={mc.lattice} onChange={(patch) => update((c) => ({ ...c, lattice: { ...c.lattice, ...patch } }))} /><StructurePanel structure={mc.structure} materials={Object.keys(mc.materials)} onChange={(patch) => update((c) => ({ ...c, structure: { ...c.structure, ...patch } }))} /><MaterialsPanel materials={mc.materials} onChange={(materials) => update((c) => ({ ...c, materials }))} /><PhysicsPanel physics={mc.physics} onChange={(patch) => update((c) => ({ ...c, physics: { ...c.physics, ...patch } }))} /><InclusionsPanel inclusions={mc.inclusions} materials={Object.keys(mc.materials)} selectedId={selectedId} onSelect={setSelectedId} onChange={changeInclusion} onAdd={addInclusion} onDelete={(id) => update((c) => ({ ...c, inclusions: c.inclusions.filter((i) => i.id !== id) }))} onDuplicate={(id) => update((c) => ({ ...c, inclusions: [...c.inclusions, { ...c.inclusions.find((i) => i.id === id)!, id: `${id}_copy` }] }))} /></>}
      center={<section className="panel viz-panel"><div className="viz-controls"><label>powielenie<select value={repeat} onChange={(e) => setRepeat(Number(e.target.value))}><option value={1}>1x1</option><option value={3}>3x3</option><option value={5}>5x5</option><option value={7}>7x7</option></select></label><label><input type="checkbox" checked={showAxes} onChange={(e) => setShowAxes(e.target.checked)} /> osie</label><label><input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> etykiety</label><label><input type="checkbox" checked={showVectors} onChange={(e) => setShowVectors(e.target.checked)} /> wektory</label><label><input type="checkbox" checked={highlightCenter} onChange={(e) => setHighlightCenter(e.target.checked)} /> środkowa</label></div><Visualization2D mc={mc} selectedId={selectedId} repeat={repeat} showAxes={showAxes} showLabels={showLabels} showVectors={showVectors} highlightCenter={highlightCenter} onSelect={setSelectedId} onMove={(id: string, center_frac: Vec2) => changeInclusion(id, { center_frac })} /></section>}
      right={<><TomlEditor text={tomlText} parseError={parseError} onChange={setTomlText} onApply={() => applyToml()} /><SelectedInclusionPanel inclusion={selectedInclusion} materials={Object.keys(mc.materials)} onChange={changeInclusion} onDelete={(id) => update((c) => ({ ...c, inclusions: c.inclusions.filter((i) => i.id !== id) }))} onDuplicate={(id) => update((c) => ({ ...c, inclusions: [...c.inclusions, { ...c.inclusions.find((i) => i.id === id)!, id: `${id}_copy` }] }))} /><ValidationPanel messages={messages} /></>}
    />
  );
}
