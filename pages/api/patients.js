// components/PatientForm.jsx
// SwasthyaSathi · Add Patient Record
// DiagnosisPanel is imported at the top and used inside the JSX — correctly wired.

import { useState } from 'react';
import { insertPatient } from '../lib/patientService';
import DiagnosisPanel from './DiagnosisPanel';

const INITIAL = {
  name: '',
  age: '',
  gender: 'Female',
  symptoms: '',
  diagnosis: '',
  village: '',
};

export default function PatientForm({ onSuccess }) {
  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Called by DiagnosisPanel when AI returns — auto-fills the diagnosis field
  const handleAIResult = (diagnosisText) => {
    setForm((prev) => ({ ...prev, diagnosis: diagnosisText }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await insertPatient({
      ...form,
      age: parseInt(form.age, 10),
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
      return;
    }

    setMessage({ type: 'success', text: `Patient "${data.name}" saved successfully!` });
    setForm(INITIAL);
    if (onSuccess) onSuccess(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <h2>Add Patient Record</h2>

      {/* Name */}
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Patient Name *"
        required
      />

      {/* Age */}
      <input
        name="age"
        type="number"
        value={form.age}
        onChange={handleChange}
        placeholder="Age *"
        min="1"
        max="120"
        required
      />

      {/* Gender */}
      <select name="gender" value={form.gender} onChange={handleChange} required>
        <option value="Female">Female</option>
        <option value="Male">Male</option>
        <option value="Other">Other</option>
      </select>

      {/* Village */}
      <input
        name="village"
        value={form.village}
        onChange={handleChange}
        placeholder="Village *"
        required
      />

      {/* Symptoms */}
      <textarea
        name="symptoms"
        value={form.symptoms}
        onChange={handleChange}
        placeholder="Symptoms (e.g. Fever, Cough, Body Pain)"
        rows={3}
      />

      {/* ── AI Diagnosis Panel ──────────────────────────────────────
          Sits between the symptoms textarea and the diagnosis field.
          Reads symptoms/age/gender from form state.
          When AI responds, onResult auto-fills the diagnosis field.
      ────────────────────────────────────────────────────────────── */}
      <DiagnosisPanel
        symptoms={form.symptoms}
        age={form.age}
        gender={form.gender}
        onResult={handleAIResult}
      />

      {/* Diagnosis — auto-filled by AI, still editable by ASHA worker */}
      <textarea
        name="diagnosis"
        value={form.diagnosis}
        onChange={handleChange}
        placeholder="Diagnosis / Notes (AI will fill this — you can edit)"
        rows={2}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Patient Record'}
      </button>

      {message && (
        <p style={{ color: message.type === 'error' ? 'red' : 'green' }}>
          {message.text}
        </p>
      )}
    </form>
  );
}