import { cellArea } from "./geometry";
import type { MC2D, ValidationMessage, Vec3 } from "./types";

const length3 = (v?: Vec3) => (v ? Math.hypot(v[0], v[1], v[2]) : 0);

export function validateMC2D(mc: MC2D): ValidationMessage[] {
  const out: ValidationMessage[] = [];
  const err = (path: string, message: string) => out.push({ level: "error", path, message });
  const warn = (path: string, message: string) => out.push({ level: "warning", path, message });

  if (!mc.schema_version) err("schema_version", "Brak wersji schematu.");
  if (mc.units !== "SI") err("units", "Obsługiwany jest tylko układ SI.");
  if (!(mc.lattice.a > 0)) err("lattice.a", "Stała a musi być dodatnia.");
  if (!(mc.lattice.b > 0)) err("lattice.b", "Stała b musi być dodatnia.");
  if (!(mc.lattice.sx > 0)) err("lattice.sx", "Ściśnięcie sx musi być dodatnie.");
  if (!(mc.lattice.sy > 0)) err("lattice.sy", "Ściśnięcie sy musi być dodatnie.");
  if (!(cellArea(mc.lattice) > 0)) err("lattice.a1/a2", "Pole komórki musi być dodatnie.");
  if (!(mc.structure.thickness > 0)) err("structure.thickness", "Grubość warstwy musi być dodatnia.");
  if (!mc.materials[mc.structure.host_material]) err("structure.host_material", "Materiał tła nie istnieje w sekcji materials.");

  for (const [name, mat] of Object.entries(mc.materials)) {
    if (!(mat.Ms >= 0)) err(`materials.${name}.Ms`, "Ms musi być nieujemne.");
    if (!(mat.Aex >= 0)) err(`materials.${name}.Aex`, "Aex musi być nieujemne.");
    if (!(mat.Lex >= 0)) err(`materials.${name}.Lex`, "Lex musi być nieujemne.");
    if (!(mat.alpha >= 0)) err(`materials.${name}.alpha`, "alpha musi być nieujemne.");
    if (mat.anis_axis && length3(mat.anis_axis) === 0) warn(`materials.${name}.anis_axis`, "Oś anizotropii ma zerową długość.");
  }

  if (!(mc.physics.mu0 > 0)) err("physics.mu0", "mu0 musi być dodatnie.");
  if (!(mc.physics.gamma > 0)) err("physics.gamma", "gamma musi być dodatnie.");
  if (!(mc.physics.H0 >= 0)) err("physics.H0", "H0 musi być nieujemne.");
  if (length3(mc.physics.H0_dir) === 0) err("physics.H0_dir", "Kierunek H0_dir nie może mieć zerowej długości.");
  if (mc.physics.m_eq && length3(mc.physics.m_eq) === 0) err("physics.m_eq", "m_eq nie może mieć zerowej długości.");

  const ids = new Set<string>();
  let sum = 0;
  for (const inc of mc.inclusions) {
    if (ids.has(inc.id)) err(`inclusions.${inc.id}`, "Zduplikowane id inkluzji.");
    ids.add(inc.id);
    if (!mc.materials[inc.material]) err(`inclusions.${inc.id}.material`, "Materiał inkluzji nie istnieje.");
    if (!(inc.fil_frac >= 0 && inc.fil_frac <= 1)) err(`inclusions.${inc.id}.fil_frac`, "fil_frac musi być w zakresie [0, 1].");
    if (!Number.isFinite(inc.center_frac[0]) || !Number.isFinite(inc.center_frac[1])) err(`inclusions.${inc.id}.center_frac`, "Niepoprawne współrzędne frakcyjne.");
    sum += inc.fil_frac;
  }
  if (sum > 1) warn("inclusions", "Suma fil_frac przekracza 1. Eksport jest możliwy, ale geometria może nakładać się lub przepełniać komórkę.");
  return out;
}
