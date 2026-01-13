import React, { useMemo, useState } from "react";
import { semantics } from "./config/semantics";
import { dsCodes } from "./config/dsCodes";
import { semanticToDsCodes } from "./config/mappings";

function Panel({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "white",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid #d1d5db",
        borderRadius: 999,
        padding: "6px 12px",
        background: active ? "#111827" : "white",
        color: active ? "white" : "#111827",
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {children}
    </button>
  );
}

function Markdownish({ text }) {
  // Minimal formatting: headings and bold markers; keeps prototype dependency-free.
  const lines = (text || "").split("\n");
  return (
    <div style={{ lineHeight: 1.5 }}>
      {lines.map((ln, idx) => {
        const h2 = ln.startsWith("## ");
        const h3 = ln.startsWith("### ");
        const content = ln.replace(/^##\s+/, "").replace(/^###\s+/, "");
        if (h2) return <div key={idx} style={{ fontWeight: 800, marginTop: 14 }}>{content}</div>;
        if (h3) return <div key={idx} style={{ fontWeight: 700, marginTop: 10 }}>{content}</div>;
        // bold **text**
        const parts = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        return (
          <div key={idx} style={{ marginTop: ln.trim() ? 6 : 10 }}>
            {parts.map((p, i) => {
              const m = p.match(/^\*\*([^*]+)\*\*$/);
              return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{p}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function SemanticCabinet() {
  const [semanticId, setSemanticId] = useState("");
  const [capsule, setCapsule] = useState("S");
  const [dsCode, setDsCode] = useState("");

  const selectedSemantic = useMemo(
    () => semantics.find((s) => s.semanticId === semanticId),
    [semanticId]
  );

  const allowedDs = useMemo(() => {
    const list = semanticToDsCodes[semanticId] || [];
    return dsCodes.filter((d) => list.includes(d.code));
  }, [semanticId]);

  // When semantic changes, reset DSCode if no longer valid
  React.useEffect(() => {
    if (!semanticId) {
      setDsCode("");
      return;
    }
    const allowed = new Set((semanticToDsCodes[semanticId] || []));
    if (dsCode && !allowed.has(dsCode)) setDsCode("");
  }, [semanticId, dsCode]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>
        CGL Semantic Cabinet — Prototype v0.1
      </div>
      <div style={{ color: "#374151" }}>
        Meaning first. Depth by choice. DSCode stored as the system value.
      </div>

      <Panel title="1) Choose Semantic (meaning)">
        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontSize: 13, color: "#374151" }}>
            What is the purpose of this content?
          </label>
          <select
            value={semanticId}
            onChange={(e) => setSemanticId(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #d1d5db",
              maxWidth: 520,
            }}
          >
            <option value="">— Select a Semantic —</option>
            {semantics.map((s) => (
              <option key={s.semanticId} value={s.semanticId}>
                {s.semanticId} | {s.title}
              </option>
            ))}
          </select>

          {selectedSemantic ? (
            <div style={{ marginTop: 8, color: "#111827" }}>
              <div style={{ fontWeight: 700 }}>
                Quick meaning (S capsule):
              </div>
              <div style={{ marginTop: 6, padding: 12, borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                {selectedSemantic.capsules.S}
              </div>
            </div>
          ) : (
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              Select a semantic to see the quick explanation.
            </div>
          )}
        </div>
      </Panel>

      <Panel title="2) Choose Capsule Depth (optional)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["XS", "S", "M", "L"].map((c) => (
            <Pill key={c} active={capsule === c} onClick={() => setCapsule(c)}>
              {c}
            </Pill>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          {selectedSemantic ? (
            capsule === "XS" ? (
              <div style={{ padding: 12, borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                {selectedSemantic.capsules.XS}
              </div>
            ) : capsule === "S" ? (
              <div style={{ padding: 12, borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                {selectedSemantic.capsules.S}
              </div>
            ) : capsule === "M" ? (
              <div style={{ padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb" }}>
                <Markdownish text={selectedSemantic.capsules.M} />
              </div>
            ) : (
              <div style={{ padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb" }}>
                <Markdownish text={selectedSemantic.capsules.L} />
              </div>
            )
          ) : (
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              Choose a semantic first.
            </div>
          )}
        </div>
      </Panel>

      <Panel title="3) Choose DSCode (system value)">
        {!semanticId ? (
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            Select a semantic first; then DSCode options will appear.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 13, color: "#374151" }}>
              DSCode options filtered by {semanticId}
            </label>
            <select
              value={dsCode}
              onChange={(e) => setDsCode(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                maxWidth: 520,
              }}
            >
              <option value="">— Select a DSCode —</option>
              {allowedDs.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} | {d.label}
                </option>
              ))}
            </select>

            <div style={{ color: "#374151", fontSize: 13 }}>
              Stored value (what you would save in DB):{" "}
              <span style={{ fontWeight: 800 }}>{dsCode || "—"}</span>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Prototype Notes">
        <div style={{ color: "#374151", fontSize: 13 }}>
          <ul style={{ marginTop: 0 }}>
            <li>All content lives in config files under <code>src/semanticCabinet/config</code>.</li>
            <li>Swap these controls with Ant Design later if desired.</li>
            <li>Next integration step: connect DSCode to your Book/Chapter/Section forms.</li>
          </ul>
        </div>
      </Panel>
    </div>
  );
}
