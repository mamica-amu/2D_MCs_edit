import type { PointerEvent as ReactPointerEvent } from "react";
import { cartesianToFrac, cellArea, fracToCartesian } from "../model/geometry";
import type { Inclusion, MC2D, Vec2 } from "../model/types";

const colors = ["#1f77b4", "#d62728", "#2ca02c", "#9467bd", "#ff7f0e", "#17becf"];
const SCALE = 1e9;

function materialColor(name: string, materials: string[]) {
  return colors[Math.max(0, materials.indexOf(name)) % colors.length];
}

function pathForCell(a1: Vec2, a2: Vec2) {
  return `M 0 0 L ${a1[0] * SCALE} ${-a1[1] * SCALE} L ${(a1[0] + a2[0]) * SCALE} ${-(a1[1] + a2[1]) * SCALE} L ${a2[0] * SCALE} ${-a2[1] * SCALE} Z`;
}

function repeatSpan(repeat: number): number[] {
  const half = Math.floor(Math.max(1, repeat) / 2);
  return Array.from({ length: half * 2 + 1 }, (_, index) => index - half);
}

function inclusionNode(inc: Inclusion, materials: string[], onDown: (id: string, e: ReactPointerEvent<SVGElement>) => void, selected: boolean, interactive = true, muted = false) {
  const c = inc.center;
  const x = c[0] * SCALE;
  const y = -c[1] * SCALE;
  const fill = materialColor(inc.material, materials);
  const common = {
    fill,
    opacity: muted ? 0.45 : 0.82,
    stroke: selected ? "#111827" : "#ffffff",
    strokeWidth: selected ? 5 : 2.5,
    onPointerDown: interactive ? (e: ReactPointerEvent<SVGElement>) => onDown(inc.id, e) : undefined,
    className: interactive ? "inclusion-shape" : "inclusion-shape ghost"
  };
  if (inc.shape === "circle") return <circle key={inc.id} cx={x} cy={y} r={(inc.radius ?? 0) * SCALE} {...common} />;
  if (inc.shape === "ellipse") return <ellipse key={inc.id} cx={x} cy={y} rx={(inc.rx ?? 0) * SCALE} ry={(inc.ry ?? 0) * SCALE} transform={`rotate(${-(inc.rotation_deg ?? 0)} ${x} ${y})`} {...common} />;
  if (inc.shape === "rectangle") return <rect key={inc.id} x={x - ((inc.wx ?? 0) * SCALE) / 2} y={y - ((inc.wy ?? 0) * SCALE) / 2} width={(inc.wx ?? 0) * SCALE} height={(inc.wy ?? 0) * SCALE} transform={`rotate(${-(inc.rotation_deg ?? 0)} ${x} ${y})`} {...common} />;
  const points = (inc.vertices?.length ? inc.vertices : [[-30e-9, -30e-9], [30e-9, -30e-9], [0, 35e-9]]).map((v) => `${x + v[0] * SCALE},${y - v[1] * SCALE}`).join(" ");
  return <polygon key={inc.id} points={points} {...common} />;
}

interface Props {
  mc: MC2D;
  selectedId?: string;
  repeat: number;
  showAxes: boolean;
  showLabels: boolean;
  showVectors: boolean;
  highlightCenter: boolean;
  allowDrag: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, centerFrac: Vec2) => void;
}

export function Visualization2D({ mc, selectedId, repeat, showAxes, showLabels, showVectors, highlightCenter, allowDrag, onSelect, onMove }: Props) {
  const area = cellArea(mc.lattice);
  if (!(area > 0)) return <section className="viz-empty">Brak poprawnej geometrii komórki. Sprawdź a1/a2 lub parametry sieci.</section>;
  const a1 = mc.lattice.a1;
  const a2 = mc.lattice.a2;
  const max = Math.max(Math.hypot(...a1), Math.hypot(...a2), 1e-9) * SCALE;
  const pad = max * 0.85;
  const span = repeatSpan(repeat);
  const corners: Vec2[] = [];
  for (const i of span) {
    for (const j of span) {
      const off = fracToCartesian([i, j], mc.lattice);
      corners.push(off, [off[0] + a1[0], off[1] + a1[1]], [off[0] + a2[0], off[1] + a2[1]], [off[0] + a1[0] + a2[0], off[1] + a1[1] + a2[1]]);
    }
  }
  const xs = corners.map((p) => p[0] * SCALE);
  const ys = corners.map((p) => -p[1] * SCALE);
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  const materials = Object.keys(mc.materials);

  const pointerDown = (id: string, e: ReactPointerEvent<SVGElement>) => {
    e.preventDefault();
    onSelect(id);
    if (!allowDrag) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const move = (event: globalThis.PointerEvent) => {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
      const center: Vec2 = [svgPoint.x / SCALE, -svgPoint.y / SCALE];
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
  for (const i of span) for (const j of span) cells.push([i, j] as const);

  return (
    <svg id="mc-svg" className="visualization" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" />
        </marker>
      </defs>
      <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} className="viz-bg" />
      {showAxes && <g className="axes"><line x1={minX} y1="0" x2={maxX} y2="0" stroke="#6b7280" strokeWidth="1.4" strokeDasharray="8 8" /><line x1="0" y1={minY} x2="0" y2={maxY} stroke="#6b7280" strokeWidth="1.4" strokeDasharray="8 8" /><text x={maxX - pad * 0.5} y={-pad * 0.08} fill="#111827" fontSize="18">x</text><text x={pad * 0.08} y={minY + pad * 0.35} fill="#111827" fontSize="18">y</text></g>}
      {cells.map(([i, j]) => {
        const off = fracToCartesian([i, j], mc.lattice);
        const isMain = i === 0 && j === 0;
        const drawAsMain = isMain || !highlightCenter;
        return (
          <g key={`${i}:${j}`} transform={`translate(${off[0] * SCALE} ${-off[1] * SCALE})`} className={drawAsMain ? "main-cell" : "repeat-cell"}>
            <path
              d={pathForCell(a1, a2)}
              fill={drawAsMain ? "rgba(29, 95, 153, 0.08)" : "rgba(29, 95, 153, 0.025)"}
              stroke={drawAsMain ? "#1d5f99" : "#94a3b8"}
              strokeWidth={drawAsMain ? 3 : 1.5}
            />
            {mc.inclusions.map((inc) => inclusionNode(inc, materials, pointerDown, highlightCenter && isMain && inc.id === selectedId, isMain, highlightCenter && !isMain))}
            {showLabels && mc.inclusions.map((inc) => (
              <text className={highlightCenter && isMain ? "inc-label" : "inc-label ghost"} key={`${i}:${j}:${inc.id}-label`} x={inc.center[0] * SCALE} y={-inc.center[1] * SCALE}>
                {highlightCenter && isMain ? `${inc.id} / ${inc.material}` : inc.id}
              </text>
            ))}
          </g>
        );
      })}
      {showVectors && <g className="vectors"><line x1="0" y1="0" x2={a1[0] * SCALE} y2={-a1[1] * SCALE} stroke="#111827" strokeWidth="2.5" markerEnd="url(#arrow)" /><line x1="0" y1="0" x2={a2[0] * SCALE} y2={-a2[1] * SCALE} stroke="#111827" strokeWidth="2.5" markerEnd="url(#arrow)" /><text x={a1[0] * SCALE} y={-a1[1] * SCALE} fill="#111827" fontSize="18">a1</text><text x={a2[0] * SCALE} y={-a2[1] * SCALE} fill="#111827" fontSize="18">a2</text></g>}
    </svg>
  );
}
