export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type ShapeType = "circle" | "ellipse" | "rectangle" | "polygon";
export type CompressionFrame = "lattice" | "lab";

export interface FillingInfo {
  total_fil_frac?: number;
  by_material?: Record<string, number>;
}

export interface Lattice2D {
  type: "square" | "rectangular" | "hexagonal" | "oblique" | "custom";
  a: number;
  b: number;
  cell_angle_deg: number;
  cell_angle_rad: number;
  rotation_deg: number;
  rotation_rad: number;
  sx: number;
  sy: number;
  compression_frame: CompressionFrame;
  a1: Vec2;
  a2: Vec2;
}

export interface Structure2D {
  thickness: number;
  host_material: string;
  filling?: FillingInfo;
}

export interface Material {
  Ms: number;
  Aex: number;
  Lex: number;
  alpha: number;
  Ku1?: number;
  anis_axis?: Vec3;
  Dind?: number;
}

export interface Physics {
  gamma: number;
  mu0: number;
  H0: number;
  H0_dir: Vec3;
  m_eq?: Vec3;
  demag: "full" | "thinfilm" | "none" | string;
  equilibrium: "saturated" | "relax" | "imported" | string;
}

export interface Inclusion {
  id: string;
  material: string;
  shape: ShapeType;
  center_frac: Vec2;
  center: Vec2;
  fil_frac: number;
  priority: number;
  radius?: number;
  rx?: number;
  ry?: number;
  wx?: number;
  wy?: number;
  rotation_deg?: number;
  rotation_rad?: number;
  vertices?: Vec2[];
}

export interface MC2D {
  schema_version: string;
  units: "SI";
  lattice: Lattice2D;
  structure: Structure2D;
  materials: Record<string, Material>;
  inclusions: Inclusion[];
  physics: Physics;
}

export interface ValidationMessage {
  level: "error" | "warning";
  path: string;
  message: string;
}
