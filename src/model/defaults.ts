import { normalizeMC2D } from "./geometry";
import type { MC2D } from "./types";

export const defaultMC2D: MC2D = normalizeMC2D({
  materials: {
    Py: { Ms: 8e5, Aex: 13e-12, Lex: 5.7e-9, alpha: 0.01 },
    CoFeB: { Ms: 1.1e6, Aex: 20e-12, Lex: 5.1e-9, alpha: 0.008, Ku1: 5e5, anis_axis: [0, 0, 1], Dind: 1e-3 },
    void: { Ms: 0, Aex: 0, Lex: 0, alpha: 0 }
  },
  inclusions: [
    { id: "inc1", material: "CoFeB", shape: "circle", center_frac: [0.25, 0.25], radius: 50e-9, priority: 10 },
    { id: "inc2", material: "void", shape: "ellipse", center_frac: [0.75, 0.75], rx: 60e-9, ry: 30e-9, rotation_deg: 45, priority: 20 }
  ] as Partial<MC2D["inclusions"][number]>[]
} as Partial<MC2D>);
