const colors = ["#1f77b4", "#d62728", "#2ca02c", "#9467bd", "#ff7f0e", "#17becf"];

export function materialColor(name: string, materials: string[]) {
  return colors[Math.max(0, materials.indexOf(name)) % colors.length];
}
