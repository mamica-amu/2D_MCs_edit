import { describe, expect, it } from "vitest";
import squareExample from "../examples/square_two_inclusions.toml?raw";
import { cellArea, computeLatticeVectors, degToRad, fracToCartesian, cartesianToFrac, inclusionFillFraction, radToDeg, resizeInclusionToFillFraction } from "./geometry";
import { exportToml, parseToml } from "./toml";
import { validateMC2D } from "./validation";

describe("geometria 2D MC", () => {
  it("konwertuje stopnie i radiany", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
  });

  it("oblicza a1 i a2 dla sieci kwadratowej", () => {
    const [a1, a2] = computeLatticeVectors({ type: "square", a: 400e-9, b: 400e-9, cell_angle_deg: 90, sx: 1, sy: 1, rotation_deg: 0, compression_frame: "lattice" });
    expect(a1[0]).toBeCloseTo(400e-9);
    expect(a2[1]).toBeCloseTo(400e-9);
  });

  it("oblicza pole komórki", () => {
    expect(cellArea({ a1: [2, 0], a2: [0, 3] })).toBeCloseTo(6);
  });

  it("konwertuje center_frac i center", () => {
    const lattice = { a1: [400e-9, 0] as [number, number], a2: [0, 400e-9] as [number, number] };
    const center = fracToCartesian([0.25, 0.75], lattice);
    expect(center[0]).toBeCloseTo(100e-9);
    expect(cartesianToFrac(center, lattice)[1]).toBeCloseTo(0.75);
  });

  it("oblicza fil_frac", () => {
    const mc = parseToml(squareExample);
    expect(inclusionFillFraction(mc.inclusions[0], mc.lattice)).toBeGreaterThan(0);
  });

  it("przelicza fil_frac na rozmiar z zachowaniem proporcji elipsy", () => {
    const mc = parseToml(squareExample);
    const ellipse = mc.inclusions[1];
    const ratio = (ellipse.rx ?? 1) / (ellipse.ry ?? 1);
    const resized = resizeInclusionToFillFraction(ellipse, mc.lattice, 0.2);
    expect(inclusionFillFraction(resized, mc.lattice)).toBeCloseTo(0.2);
    expect((resized.rx ?? 1) / (resized.ry ?? 1)).toBeCloseTo(ratio);
  });
});

describe("TOML i walidacja", () => {
  it("importuje i eksportuje TOML", () => {
    const mc = parseToml(squareExample);
    const text = exportToml(mc);
    const again = parseToml(text);
    expect(again.inclusions).toHaveLength(2);
    expect(again.materials.Py.Ms).toBeCloseTo(8e5);
  });

  it("waliduje materiały", () => {
    const mc = parseToml(squareExample);
    mc.materials.Py.Ms = -1;
    expect(validateMC2D(mc).some((m) => m.path === "materials.Py.Ms")).toBe(true);
  });

  it("waliduje inkluzje", () => {
    const mc = parseToml(squareExample);
    mc.inclusions[0].material = "brak";
    expect(validateMC2D(mc).some((m) => m.path.includes("material"))).toBe(true);
  });
});
