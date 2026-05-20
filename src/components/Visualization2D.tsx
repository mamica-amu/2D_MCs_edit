import type { PointerEvent as ReactPointerEvent } from "react";
import { cartesianToFrac, cellArea, fracToCartesian } from "../model/geometry";
import type { Inclusion, MC2D, Vec2 } from "../model/types";

const colors = ["#1f77b4", "#d62728", "#2ca02c", "#9467bd", "#ff7f0e", "#17becf"];

function materialColor(name: string, materials: string[]) {
  return colors[Math.max(0, materials.indexOf(name)) % colors.length];
}

function pathForCell(a1: Vec2, a2: Vec2) {
  return `M 0 0 L ${a1[0]} ${-a1[1]} L ${a1[0] + a2[0]} ${-(a1[1] + a2[1])} L ${a2[0]} ${-a2[1]} Z`;
}

function inclusionNode(inc: Inclusion, materials: string[], onDown: (id: string, e: ReactPointerEvent<SVGElement>) => void, selected: boolean) {
  const c = inc.center;
  const fill = materialColor(inc.material, materials);
  const common = { fill, opacity: 0.78, stroke: selected ? "#111827" : "#ffffff", strokeWidth: selected ? 8e-9 : 4e-9, onPointerDown: (e: ReactPointerEvent<SVGElement>) => onDown(inc.id, e), className: "inclusion-shape" };
  if (inc.shape === "circle") return <circle key={inc.id} cx={c[0]} cy={-c[1]} r={inc.radius ?? 0} {...common} />;
  if (inc.shape === "ellipse") return <ellipse key={inc.id} cx={c[0]} cy={-c[1]} rx={inc.rx ?? 0} ry={inc.ry ?? 0} transform={`rotate(${-(inc.rotation_deg ?? 0)} ${c[0]} ${-c[1]})`} {...common} />;
  if (inc.shape === "rectangle") return <rect key={inc.id} x={c[0] - (inc.wx ?? 0) / 2} y={-c[1] - (inc.wy ?? 0) / 2} width={inc.wx ?? 0} height={inc.wy ?? 0} transform={`rotate(${-(inc.rotation_deg ?? 0)} ${c[0]} ${-c[1]})`} {...common} />;
  const points = (inc.vertices?.length ? inc.vertices : [[-30e-9, -30e-9], [30e-9, -30e-9], [0, 35e-9]]).map((v) => `${c[0] + v[0]},${-(c[1] + v[1])}`).join(" ");
  return <polygon key={inc.id} points={points} {...common} />;
}

interface Props {
  mc: MC2D;
  selectedId?: string;
  repeat: number;
  showAxes: boolean;
  showLabels: boolean;
  showVectors: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, centerFrac: Vec2) => void;
}

export function Visualization2D({ mc, selectedId, repeat, showAxes, showLabels, showVectors, onSelect, onMove }: Props) {
  const area = cellArea(mc.lattice);
  if (!(area > 0)) return <section className="viz-empty">Brak poprawnej geometrii komórki. Sprawdź a1/a2 lub parametry sieci.</section>;
  const a1 = mc.lattice.a1;
  const a2 = mc.lattice.a2;
  const max = Math.max(Math.hypot(...a1), Math.hypot(...a2), 1e-9);
  const pad = max * 0.85;
  const minX = Math.min(0, a1[0], a2[0], a1[0] + a2[0]) - pad;
  const maxX = Math.max(0, a1[0], a2[0], a1[0] + a2[0]) + pad;
  const minY = -Math.max(0, a1[1], a2[1], a1[1] + a2[1]) - pad;
  const maxY = -Math.min(0, a1[1], a2[1], a1[1] + a2[1]) + pad;
  const materials = Object.keys(mc.materials);

  const pointerDown = (id: string, e: ReactPointerEvent<SVGElement>) => {
    e.preventDefault();
    onSelect(id);
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const move = (event: globalThis.PointerEvent) => {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
      const center: Vec2 = [svgPoint.x, -svgPoint.y];
      onMove(id, cartesianToFrac(center, mc.lattice));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const cells = [];
  const span = repeat === 3 ? [-1, 0, 1] : [0];
  for (const i of span) for (const j of span) cells.push([i, j] as const);

  return (
    <svg id="mc-svg" className="visualization" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}>
      {showAxes && <g className="axes"><line x1={minX} y1="0" x2={maxX} y2="0" /><line x1="0" y1={minY} x2="0" y2={maxY} /><text x={maxX - pad * 0.5} y={-pad * 0.08}>x</text><text x={pad * 0.08} y={minY + pad * 0.35}>y</text></g>}
      {cells.map(([i, j]) => {
        const off = fracToCartesian([i, j], mc.lattice);
        return <g key={`${i}:${j}`} transform={`translate(${off[0]} ${-off[1]})`} className={i || j ? "repeat-cell" : "main-cell"}><path d={pathForCell(a1, a2)} /></g>;
      })}
      {showVectors && <g className="vectors"><line x1="0" y1="0" x2={a1[0]} y2={-a1[1]} /><line x1="0" y1="0" x2={a2[0]} y2={-a2[1]} /><text x={a1[0]} y={-a1[1]}>a1</text><text x={a2[0]} y={-a2[1]}>a2</text></g>}
      {mc.inclusions.map((inc) => inclusionNode(inc, materials, pointerDown, inc.id === selectedId))}
      {showLabels && mc.inclusions.map((inc) => <text className="inc-label" key={`${inc.id}-label`} x={inc.center[0]} y={-inc.center[1]}>{inc.id} / {inc.material}</text>)}
    </svg>
  );
}
