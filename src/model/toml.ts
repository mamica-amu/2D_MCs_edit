import { normalizeMC2D } from "./geometry";
import type { Inclusion, MC2D, Material } from "./types";

interface TomlObject {
  [key: string]: TomlValue;
}
type TomlValue = string | number | boolean | TomlValue[] | TomlObject;

function stripComment(line: string): string {
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"' && line[i - 1] !== "\\") quoted = !quoted;
    if (ch === "#" && !quoted) return line.slice(0, i);
  }
  return line;
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quoted = false;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"' && text[i - 1] !== "\\") quoted = !quoted;
    if (!quoted && ch === "[") depth += 1;
    if (!quoted && ch === "]") depth -= 1;
    if (!quoted && depth === 0 && ch === ",") {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

function parseValue(raw: string): TomlValue {
  const value = raw.trim();
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith("[") && value.endsWith("]")) {
    const body = value.slice(1, -1).trim();
    return body ? splitTopLevel(body).map(parseValue) : [];
  }
  const number = Number(value.replaceAll("_", ""));
  if (!Number.isNaN(number)) return number;
  return value;
}

function setDeep(target: TomlObject, dottedKey: string, value: TomlValue) {
  const parts = dottedKey.split(".");
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) cursor[part] = {};
    cursor = cursor[part] as TomlObject;
  }
  cursor[parts[parts.length - 1]] = value;
}

function getSection(root: TomlObject, path: string[]): TomlObject {
  let cursor = root;
  for (const part of path) {
    if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) cursor[part] = {};
    cursor = cursor[part] as TomlObject;
  }
  return cursor;
}

export function parseToml(text: string): MC2D {
  const root: TomlObject = { inclusions: [] };
  let current: TomlObject = root;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = stripComment(rawLine).trim();
    if (!line) continue;
    if (line.startsWith("[[") && line.endsWith("]]")) {
      const section = line.slice(2, -2).trim();
      if (section !== "inclusions") throw new Error(`Nieobsługiwana tablica tabel: ${section}`);
      const inclusion: TomlObject = {};
      (root.inclusions as TomlValue[]).push(inclusion);
      current = inclusion;
      continue;
    }
    if (line.startsWith("[") && line.endsWith("]")) {
      current = getSection(root, line.slice(1, -1).trim().split("."));
      continue;
    }
    const equal = line.indexOf("=");
    if (equal < 0) throw new Error(`Niepoprawna linia TOML: ${line}`);
    setDeep(current, line.slice(0, equal).trim(), parseValue(line.slice(equal + 1)));
  }
  return normalizeMC2D(root as unknown as Partial<MC2D>);
}

function num(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "0.0";
  if (value !== 0 && (Math.abs(value) < 1e-4 || Math.abs(value) >= 1e5)) return value.toExponential(12).replace(/0+e/, "e");
  return Number.isInteger(value) ? `${value}` : `${Number(value.toPrecision(12))}`;
}

function arr(values: number[]): string {
  return `[${values.map(num).join(", ")}]`;
}

function materialToml(name: string, material: Material): string {
  const lines = [`[materials.${name}]`, `Ms = ${num(material.Ms)}`, `Aex = ${num(material.Aex)}`, `Lex = ${num(material.Lex)}`, `alpha = ${num(material.alpha)}`];
  if (material.Ku1 !== undefined) lines.push(`Ku1 = ${num(material.Ku1)}`);
  if (material.anis_axis) lines.push(`anis_axis = ${arr(material.anis_axis)}`);
  if (material.Dind !== undefined) lines.push(`Dind = ${num(material.Dind)}`);
  return lines.join("\n");
}

function inclusionToml(inclusion: Inclusion): string {
  const lines = [
    "[[inclusions]]",
    `id = "${inclusion.id}"`,
    `material = "${inclusion.material}"`,
    `shape = "${inclusion.shape}"`,
    `center_frac = ${arr(inclusion.center_frac)}`,
    `center = ${arr(inclusion.center)}`,
    `fil_frac = ${num(inclusion.fil_frac)}`,
    `priority = ${num(inclusion.priority)}`
  ];
  if (inclusion.radius !== undefined) lines.splice(6, 0, `radius = ${num(inclusion.radius)}`);
  if (inclusion.rx !== undefined) lines.splice(6, 0, `rx = ${num(inclusion.rx)}`);
  if (inclusion.ry !== undefined) lines.splice(7, 0, `ry = ${num(inclusion.ry)}`);
  if (inclusion.wx !== undefined) lines.splice(6, 0, `wx = ${num(inclusion.wx)}`);
  if (inclusion.wy !== undefined) lines.splice(7, 0, `wy = ${num(inclusion.wy)}`);
  if (inclusion.rotation_deg !== undefined) lines.push(`rotation_deg = ${num(inclusion.rotation_deg)}`);
  if (inclusion.rotation_rad !== undefined) lines.push(`rotation_rad = ${num(inclusion.rotation_rad)}`);
  if (inclusion.vertices?.length) lines.push(`vertices = [${inclusion.vertices.map((v) => arr(v)).join(", ")}]`);
  return lines.join("\n");
}

export function exportToml(mc: MC2D): string {
  const lines = [
    `schema_version = "${mc.schema_version}"`,
    `units = "${mc.units}"`,
    "",
    "[lattice]",
    `type = "${mc.lattice.type}"`,
    `a = ${num(mc.lattice.a)}`,
    `b = ${num(mc.lattice.b)}`,
    `cell_angle_deg = ${num(mc.lattice.cell_angle_deg)}`,
    `cell_angle_rad = ${num(mc.lattice.cell_angle_rad)}`,
    `rotation_deg = ${num(mc.lattice.rotation_deg)}`,
    `rotation_rad = ${num(mc.lattice.rotation_rad)}`,
    `sx = ${num(mc.lattice.sx)}`,
    `sy = ${num(mc.lattice.sy)}`,
    `compression_frame = "${mc.lattice.compression_frame}"`,
    `a1 = ${arr(mc.lattice.a1)}`,
    `a2 = ${arr(mc.lattice.a2)}`,
    "",
    "[structure]",
    `thickness = ${num(mc.structure.thickness)}`,
    `host_material = "${mc.structure.host_material}"`,
    "",
    "[structure.filling]",
    `total_fil_frac = ${num(mc.structure.filling?.total_fil_frac ?? 0)}`
  ];
  for (const [name, value] of Object.entries(mc.structure.filling?.by_material ?? {})) lines.push(`by_material.${name} = ${num(value)}`);
  lines.push("", ...Object.entries(mc.materials).map(([name, mat]) => materialToml(name, mat)).join("\n\n").split("\n"));
  lines.push("", ...mc.inclusions.map(inclusionToml).join("\n\n").split("\n"));
  lines.push(
    "",
    "[physics]",
    `gamma = ${num(mc.physics.gamma)}`,
    `mu0 = ${num(mc.physics.mu0)}`,
    `H0 = ${num(mc.physics.H0)}`,
    `H0_dir = ${arr(mc.physics.H0_dir)}`,
    ...(mc.physics.m_eq ? [`m_eq = ${arr(mc.physics.m_eq)}`] : []),
    `demag = "${mc.physics.demag}"`,
    `equilibrium = "${mc.physics.equilibrium}"`
  );
  return `${lines.join("\n")}\n`;
}
