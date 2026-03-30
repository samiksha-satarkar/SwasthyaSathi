// components/DiagnosisPanel.jsx
// Drop this inside your existing patient form, just above the Diagnosis field.
// Props:
//   symptoms  — string from your existing symptoms input
//   age       — string/number from your existing age input
//   gender    — string from your existing gender select
//   onResult  — callback(diagnosisText) — auto-fills your Diagnosis field

import { useState } from "react";

export default function DiagnosisPanel({ symptoms, age, gender, onResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function analyse() {
    if (!symptoms?.trim()) {
      setError("Please enter symptoms before analysing.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const prompt = `You are a clinical decision support assistant for ASHA (Accredited Social Health Activist) workers in rural India. A frontline health worker needs help assessing a patient.

Patient info:
- Age: ${age || "not provided"}
- Gender: ${gender || "not provided"}
- Symptoms: ${symptoms}

Respond ONLY with a valid JSON object — no markdown, no explanation, no extra text before or after:
{
  "conditions": [
    { "name": "Condition name", "likelihood": 75 }
  ],
  "action": {
    "type": "treat",
    "label": "Treat at home",
    "summary": "One sentence guidance for the ASHA worker."
  },
  "medicines": ["Paracetamol 500mg every 6 hours as needed", "ORS after every loose stool"],
  "warning_signs": ["High fever above 104°F", "Difficulty breathing", "Unconsciousness"],
  "diagnosis_text": "Brief plain-text diagnosis to fill in the form, e.g.: Likely viral fever. Treat at home with paracetamol and rest. Refer to PHC if fever persists beyond 3 days."
}

Rules:
- conditions: list 2-4 most likely, likelihood values should not sum to more than 100
- action.type must be exactly one of: treat, refer, urgent
- medicines: OTC/basic only — what an ASHA worker can give
- warning_signs: 2-4 specific red flags
- diagnosis_text: short, plain English, actionable`;

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const raw = (data.content || []).map((b) => b.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setResult(parsed);
      if (onResult && parsed.diagnosis_text) {
        onResult(parsed.diagnosis_text);
      }
    } catch (e) {
      setError("AI analysis failed. Please fill the diagnosis field manually.");
    } finally {
      setLoading(false);
    }
  }

  const actionColors = {
    urgent: { bg: "#FCEBEB", color: "#791F1F", dot: "#E24B4A" },
    refer:  { bg: "#FFF3CD", color: "#633806", dot: "#EF9F27" },
    treat:  { bg: "#EAF3DE", color: "#1D5C38", dot: "#639922" },
  };
  const ac = result ? (actionColors[result.action?.type] || actionColors.treat) : null;

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={analyse}
        disabled={loading}
        style={{
          width: "100%", height: 42,
          background: loading ? "#a8d5c2" : "#1D9E75",
          color: "#fff", border: "none", borderRadius: 10,
          fontSize: 14, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginBottom: 10, transition: "background 0.15s",
        }}
      >
        {loading ? "Analysing symptoms..." : "✦  AI Symptom Analysis"}
      </button>

      {error && (
        <div style={{
          background: "#FCEBEB", color: "#791F1F",
          borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 10,
        }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{
          background: "#f3faf5", border: "1px solid #b8ddcc",
          borderRadius: 12, padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          {result.action && (
            <div>
              <Label>Recommended Action</Label>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: ac.bg, color: ac.color,
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: ac.dot }} />
                  {result.action.label}
                </span>
                <span style={{ fontSize: 12, color: "#444", lineHeight: 1.5, paddingTop: 4 }}>
                  {result.action.summary}
                </span>
              </div>
            </div>
          )}

          {result.conditions?.length > 0 && (
            <div>
              <Label>Possible Conditions</Label>
              {result.conditions.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#1a3a2a", width: 160, flexShrink: 0 }}>{c.name}</span>
                  <div style={{ flex: 1, height: 5, background: "#d4e8d8", borderRadius: 4 }}>
                    <div style={{ width: `${c.likelihood}%`, height: "100%", background: "#1D9E75", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#666", width: 32, textAlign: "right" }}>{c.likelihood}%</span>
                </div>
              ))}
            </div>
          )}

          {result.medicines?.length > 0 && (
            <div>
              <Label>Suggested Medicines</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.medicines.map((m, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "4px 10px", background: "#E1F5EE", color: "#085041", borderRadius: 20 }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {result.warning_signs?.length > 0 && (
            <div>
              <Label>Escalate to Doctor If</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.warning_signs.map((s, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "4px 10px", background: "#FCEBEB", color: "#791F1F", borderRadius: 20 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: 10, color: "#999", margin: 0, lineHeight: 1.5 }}>
            AI output is a clinical aid only. Always use your judgment. Refer when in doubt.
          </p>
        </div>
      )}
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: "#1D5C38", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7 }}>
      {children}
    </div>
  );
}