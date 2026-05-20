import type { ReactNode } from "react";

export function EditorLayout({ toolbar, left, center, right }: { toolbar: ReactNode; left: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <div className="app">
      {toolbar}
      <aside className="left-panel panel">{left}</aside>
      <main className="center-panel">{center}</main>
      <aside className="right-panel">{right}</aside>
    </div>
  );
}
