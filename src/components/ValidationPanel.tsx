import type { ValidationMessage } from "../model/types";

export function ValidationPanel({ messages }: { messages: ValidationMessage[] }) {
  const errors = messages.filter((m) => m.level === "error").length;
  const warnings = messages.filter((m) => m.level === "warning").length;
  return (
    <section className="panel validation-panel">
      <h2>Walidacja</h2>
      <p className={errors ? "bad" : "good"}>{errors} błędów, {warnings} ostrzeżeń</p>
      <ul>
        {messages.map((m, index) => (
          <li key={`${m.path}-${index}`} className={m.level}>
            <strong>{m.path}</strong>: {m.message}
          </li>
        ))}
        {!messages.length && <li className="good">Dane są poprawne według reguł MVP.</li>}
      </ul>
    </section>
  );
}
