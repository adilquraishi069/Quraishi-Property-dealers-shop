'use client';

import { useState } from 'react';

export default function InquiryForm({ propertyId, propertyTitle }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [state, setState] = useState({ saving: false, ok: false, error: '' });

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setState({ saving: true, ok: false, error: '' });
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, ...form }),
    });
    const data = await res.json();
    if (!res.ok) {
      setState({ saving: false, ok: false, error: data.error || 'Something went wrong. Please try again.' });
      return;
    }
    setState({ saving: false, ok: true, error: '' });
    setForm({ name: '', phone: '', email: '', message: '' });
  }

  return (
    <div className="form-card" id="inq">
      <h3>Request a viewing</h3>
      <p style={{ marginTop: 0, color: 'var(--muted)', fontSize: 14 }}>
        Interested in <strong>{propertyTitle}</strong>? Send an inquiry and the dealer will contact you.
      </p>
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="inq-name">Your name *</label>
            <input id="inq-name" name="name" required value={form.name} onChange={update} />
          </div>
          <div className="field">
            <label htmlFor="inq-phone">Phone *</label>
            <input id="inq-phone" name="phone" required value={form.phone} onChange={update} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="inq-email">Email (optional)</label>
          <input id="inq-email" name="email" type="email" value={form.email} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="inq-message">Message</label>
          <textarea
            id="inq-message"
            name="message"
            placeholder="I would like to visit this property…"
            value={form.message}
            onChange={update}
          />
        </div>
        <button className="btn" type="submit" disabled={state.saving}>
          {state.saving ? 'Sending…' : 'Send Inquiry'}
        </button>
        {state.ok ? (
          <div className="form-status ok">✓ Inquiry sent — the dealer will contact you soon.</div>
        ) : null}
        {state.error ? <div className="form-status err">{state.error}</div> : null}
      </form>
    </div>
  );
}
