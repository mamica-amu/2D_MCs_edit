import type { Inclusion, Lattice2D, MC2D, Vec2 } from "./types";

export const degToRad = (deg: number) => (deg * Math.PI) / 180;
export const radToDeg = (rad: number) => (rad * 180) / Math.PI;

export function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scale(v: Vec2, s: number): Vec2 {
  return [v[0] * s, v[1] * s];
}

export function det(a: Vec2, b: Vec2): number {
  return a[0] * b[1] - a[1] * b[0];
}

export function rotate(v: Vec2, angleRad: number): Vec2 {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  return [c * v[0] - s * v[1], s * v[0] + c * v[1]];
}

export function computeBaseVectors(lattice: Partial<Lattice2D>): [Vec2, Vec2] {
  const a = Number(lattice.a || 0);
  const b = Number(lattice.b || lattice.a || 0);
  const angle = lattice.type === "hexagonal" && !lattice.cell_angle_deg ? 60 : Number(lattice.cell_angle_deg ?? 90);
  return [
    [a, 0],
    [b * Math.cos(degToRad(angle)), b * Math.sin(degToRad(angle))]
  ];
}

export function computeLatticeVectors(lattice: Partial<Lattice2D>): [Vec2, Vec2] {
  if (lattice.type === "custom" && lattice.a1 && lattice.a2) return [lattice.a1, lattice.a2];
  const sx = Number(lattice.sx ?? 1);
  const sy = Number(lattice.sy ?? 1);
  const theta = Number(lattice.rotation_rad ?? degToRad(Number(lattice.rotation_deg ?? 0)));
  const frame = lattice.compression_frame ?? "lattice";
  const [b1, b2] = computeBaseVectors(lattice);
  const transform = (v: Vec2): Vec2 => {
    if (frame === "lab") return [rotate(v, theta)[0] * sx, rotate(v, theta)[1] * sy];
    return rotate([v[0] * sx, v[1] * sy], theta);
  };
  return [transform(b1), transform(b2)];
}

export function cellArea(lattice: Pick<Lattice2D, "a1" | "a2">): number {
  return Math.abs(det(lattice.a1, lattice.a2));
}

export function fracToCartesian(frac: Vec2, lattice: Pick<Lattice2D, "a1" | "a2">): Vec2 {
  return add(scale(lattice.a1, frac[0]), scale(lattice.a2, frac[1]));
}

export function cartesianToFrac(center: Vec2, lattice: Pick<Lattice2D, "a1" | "a2">): Vec2 {
  const d = det(lattice.a1, lattice.a2);
  if (Math.abs(d) < 1e-30) return [NaN, NaN];
  return [det(center, lattice.a2) / d, det(lattice.a1, center) / d];
}

export function polygonArea(vertices: Vec2[] = []): number {
  if (vertices.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < vertices.length; i += 1) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum) / 2;
}

export function inclusionArea(inclusion: Inclusion): number {
  if (inclusion.shape === "circle") return Math.PI * (inclusion.radius ?? 0) ** 2;
  if (inclusion.shape === "ellipse") return Math.PI * (inclusion.rx ?? 0) * (inclusion.ry ?? 0);
  if (inclusion.shape === "rectangle") return (inclusion.wx ?? 0) * (inclusion.wy ?? 0);
  return polygonArea(inclusion.vertices);
}

export function inclusionFillFraction(inclusion: Inclusion, lattice: Lattice2D): number {
  const area = cellArea(lattice);
  return area > 0 ? inclusionArea(inclusion) / area : 0;
}

export function resizeInclusionToFillFraction(inclusion: Inclusion, lattice: Lattice2D, filFrac: number): Inclusion {
  const targetArea = cellArea(lattice) * Math.max(0, filFrac);
  const currentArea = inclusionArea(inclusion);
  if (!(targetArea > 0)) return { ...inclusion, fil_frac: 0 };

  if (inclusion.shape === "circle") {
    return { ...inclusion, radius: Math.sqrt(targetArea / Math.PI), fil_frac: filFrac };
  }

  const ratioScale = currentArea > 0 ? Math.sqrt(targetArea / currentArea) : 1;

  if (inclusion.shape === "ellipse") {
    const rx = inclusion.rx ?? inclusion.radius ?? Math.sqrt(targetArea / Math.PI);
    const ry = inclusion.ry ?? inclusion.radius ?? rx;
    const baseArea = Math.PI * rx * ry;
    const scaleFactor = baseArea > 0 ? Math.sqrt(targetArea / baseArea) : ratioScale;
    return { ...inclusion, rx: rx * scaleFactor, ry: ry * scaleFactor, fil_frac: filFrac };
  }

  if (inclusion.shape === "rectangle") {
    const wx = inclusion.wx ?? Math.sqrt(targetArea);
    const wy = inclusion.wy ?? wx;
    const baseArea = wx * wy;
    const scaleFactor = baseArea > 0 ? Math.sqrt(targetArea / baseArea) : ratioScale;
    return { ...inclusion, wx: wx * scaleFactor, wy: wy * scaleFactor, fil_frac: filFrac };
  }

  if (inclusion.vertices?.length) {
    return { ...inclusion, vertices: inclusion.vertices.map((v) => scale(v, ratioScale)), fil_frac: filFrac };
  }

  const side = Math.sqrt((4 * targetArea) / 3);
  return {
    ...inclusion,
    vertices: [[-side / 2, -side / 3], [side / 2, -side / 3], [0, (2 * side) / 3]],
    fil_frac: filFrac
  };
}

function inclusionAspectRatio(inclusion: Inclusion): number {
  if (inclusion.shape === "ellipse" && inclusion.rx && inclusion.ry && inclusion.ry > 0) return inclusion.rx / inclusion.ry;
  if (inclusion.shape === "rectangle" && inclusion.wx && inclusion.wy && inclusion.wy > 0) return inclusion.wx / inclusion.wy;
  if (inclusion.shape === "circle") return 1;
  if (inclusion.vertices?.length) {
    const xs = inclusion.vertices.map((v) => v[0]);
    const ys = inclusion.vertices.map((v) => v[1]);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    return height > 0 ? width / height : 1;
  }
  return 1;
}

export function convertInclusionShape(inclusion: Inclusion, lattice: Lattice2D, shape: Inclusion["shape"]): Inclusion {
  const filFrac = inclusion.fil_frac > 0 ? inclusion.fil_frac : inclusionFillFraction(inclusion, lattice);
  const ratio = Math.max(1e-9, inclusionAspectRatio(inclusion));
  const seed: Inclusion = {
    ...inclusion,
    shape,
    radius: shape === "circle" ? inclusion.radius ?? inclusion.rx ?? inclusion.wx : inclusion.radius,
    rx: shape === "ellipse" ? ratio : inclusion.rx,
    ry: shape === "ellipse" ? 1 : inclusion.ry,
    wx: shape === "rectangle" ? ratio : inclusion.wx,
    wy: shape === "rectangle" ? 1 : inclusion.wy,
    vertices: shape === "polygon" ? [[-ratio / 2, -0.5], [ratio / 2, -0.5], [0, 0.5]] : inclusion.vertices,
    fil_frac: filFrac
  };
  return resizeInclusionToFillFraction(seed, lattice, filFrac);
}

export function normalizeLattice(input: Partial<Lattice2D>): Lattice2D {
  const cellDeg = Number(input.cell_angle_deg ?? radToDeg(Number(input.cell_angle_rad ?? Math.PI / 2)));
  const rotDeg = Number(input.rotation_deg ?? radToDeg(Number(input.rotation_rad ?? 0)));
  const draft: Partial<Lattice2D> = {
    type: input.type ?? "square",
    a: Number(input.a ?? 400e-9),
    b: Number(input.b ?? input.a ?? 400e-9),
    cell_angle_deg: cellDeg,
    cell_angle_rad: degToRad(cellDeg),
    rotation_deg: rotDeg,
    rotation_rad: degToRad(rotDeg),
    sx: Number(input.sx ?? 1),
    sy: Number(input.sy ?? 1),
    compression_frame: input.compression_frame ?? "lattice",
    a1: input.a1,
    a2: input.a2
  };
  const [a1, a2] = input.a1 && input.a2 ? [input.a1, input.a2] : computeLatticeVectors(draft);
  return { ...(draft as Lattice2D), a1, a2 };
}

export function normalizeInclusion(inclusion: Partial<Inclusion>, lattice: Lattice2D, index = 1): Inclusion {
  const center_frac = inclusion.center_frac ?? (inclusion.center ? cartesianToFrac(inclusion.center, lattice) : [0.5, 0.5]);
  const center = inclusion.center ?? fracToCartesian(center_frac, lattice);
  const rotation_deg = inclusion.rotation_deg ?? (inclusion.rotation_rad === undefined ? 0 : radToDeg(inclusion.rotation_rad));
  const normalized: Inclusion = {
    id: inclusion.id ?? `inc${index}`,
    material: inclusion.material ?? "void",
    shape: inclusion.shape ?? "circle",
    center_frac,
    center,
    radius: inclusion.radius ?? 40e-9,
    rx: inclusion.rx,
    ry: inclusion.ry,
    wx: inclusion.wx,
    wy: inclusion.wy,
    rotation_deg,
    rotation_rad: degToRad(rotation_deg),
    vertices: inclusion.vertices,
    fil_frac: Number(inclusion.fil_frac ?? 0),
    priority: Number(inclusion.priority ?? index * 10)
  };
  normalized.fil_frac = inclusion.fil_frac ?? inclusionFillFraction(normalized, lattice);
  return normalized;
}

export function normalizeMC2D(input: Partial<MC2D>): MC2D {
  const lattice = normalizeLattice(input.lattice ?? {});
  const materials = input.materials && Object.keys(input.materials).length ? input.materials : {
    Py: { Ms: 8e5, Aex: 13e-12, Lex: 5.7e-9, alpha: 0.01 },
    void: { Ms: 0, Aex: 0, Lex: 0, alpha: 0 }
  };
  const inclusions = (input.inclusions ?? []).map((inc, index) => normalizeInclusion(inc, lattice, index + 1));
  const total = inclusions.reduce((sum, inc) => sum + inc.fil_frac, 0);
  const byMaterial = inclusions.reduce<Record<string, number>>((acc, inc) => {
    acc[inc.material] = (acc[inc.material] ?? 0) + inc.fil_frac;
    return acc;
  }, {});
  return {
    schema_version: input.schema_version ?? "mc2d-0.2",
    units: "SI",
    lattice,
    structure: {
      thickness: Number(input.structure?.thickness ?? 20e-9),
      host_material: input.structure?.host_material ?? Object.keys(materials)[0],
      filling: { total_fil_frac: total, by_material: byMaterial }
    },
    materials,
    inclusions,
    physics: input.physics ?? {
      gamma: 1.76085963023e11,
      mu0: 1.25663706212e-6,
      H0: 0.1,
      H0_dir: [0, 0, 1],
      m_eq: [0, 0, 1],
      demag: "full",
      equilibrium: "saturated"
    }
  };
}
