'use client';

import { useCallback, useEffect, useState } from 'react';

const EMPTY = {
  title: '', type: 'house', status: 'sale', price: '', city: '', address: '',
  bedrooms: '', bathrooms: '', area: '', image_url: '', description: '',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ saving: false, error: '', ok: '' });

  const load = useCallback(async () => {
    const [p, i] = await Promise.all([
      fetch('/api/admin/properties', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/admin/inquiries', { cache: 'no-store' }).then((r) => r.json()),
    ]);
    setProperties(p.properties || []);
    setInquiries(i.inquiries || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      title: p.title, type: p.type, status: p.status, price: String(p.price),
      city: p.city, address: p.address || '', bedrooms: String(p.bedrooms || ''),
      bathrooms: String(p.bathrooms || ''), area: String(p.area || ''),
      image_url: p.image_url || '', description: p.description || '',
    });
    setTab('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setStatus({ saving: false, error: '', ok: '' });
  }

  async function save(e) {
    e.preventDefault();
    setStatus({ saving: true, error: '', ok: '' });
    const payload = {
      ...form,
      price: Number(form.price || 0),
      bedrooms: Number(form.bedrooms || 0),
      bathrooms: Number(form.bathrooms || 0),
      area: Number(form.area || 0),
    };
    const res = await fetch(editingId ? `/api/admin/properties/${editingId}` : '/api/admin/properties', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus({ saving: false, error: data.error || 'Failed to save property.', ok: '' });
      return;
    }
    cancelEdit();
    await load();
    setStatus({ saving: false, error: '', ok: editingId ? 'Property updated.' : 'Property added.' });
  }

  async function removeProperty(id) {
    if (!confirm('Delete this property and its inquiries?')) return;
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
    load();
  }

  async function removeInquiry(id) {
    if (!confirm('Delete this inquiry?')) return;
    await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
    load();
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="container admin-wrap">
      <div className="admin-top">
        <h1>Admin Dashboard</h1>
        <button className="btn-outline" onClick={logout}>Log Out</button>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'properties' ? 'active' : ''} onClick={() => setTab('properties')}>
          Properties ({properties.length})
        </button>
        <button className={tab === 'inquiries' ? 'active' : ''} onClick={() => setTab('inquiries')}>
          Inquiries ({inquiries.length})
        </button>
      </div>

      {tab === 'properties' ? (
        <div className="admin-grid">
          <div className="form-card">
            <h3>{editingId ? `Edit Property #${editingId}` : 'Add New Property'}</h3>
            <form onSubmit={save}>
              <div className="field">
                <label htmlFor="f-title">Title *</label>
                <input id="f-title" name="title" required value={form.title} onChange={update} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="f-type">Type</label>
                  <select id="f-type" name="type" value={form.type} onChange={update}>
                    {['house', 'apartment', 'land', 'shop', 'commercial'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="f-status">Status</label>
                  <select id="f-status" name="status" value={form.status} onChange={update}>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="f-price">Price (AFN) *</label>
                  <input id="f-price" name="price" type="number" required min="0" value={form.price} onChange={update} />
                </div>
                <div className="field">
                  <label htmlFor="f-city">City *</label>
                  <input id="f-city" name="city" required value={form.city} onChange={update} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="f-address">Address</label>
                <input id="f-address" name="address" value={form.address} onChange={update} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="f-bed">Bedrooms</label>
                  <input id="f-bed" name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={update} />
                </div>
                <div className="field">
                  <label htmlFor="f-bath">Bathrooms</label>
                  <input id="f-bath" name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={update} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="f-area">Area (m²)</label>
                  <input id="f-area" name="area" type="number" min="0" value={form.area} onChange={update} />
                </div>
                <div className="field">
                  <label htmlFor="f-img">Image URL</label>
                  <input id="f-img" name="image_url" value={form.image_url} onChange={update} placeholder="https://…" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="f-desc">Description</label>
                <textarea id="f-desc" name="description" value={form.description} onChange={update} />
              </div>
              <button className="btn" type="submit" disabled={status.saving}>
                {status.saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Property'}
              </button>
              {editingId ? (
                <button className="btn-outline" type="button" style={{ marginLeft: 8 }} onClick={cancelEdit}>
                  Cancel
                </button>
              ) : null}
              {status.ok ? <div className="form-status ok">✓ {status.ok}</div> : null}
              {status.error ? <div className="form-status err">{status.error}</div> : null}
            </form>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Price (AFN)</th>
                  <th>City</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id}>
                    <td>{p.image_url ? <img className="thumb" src={p.image_url} alt="" /> : null}</td>
                    <td><a href={`/property/${p.id}`}>{p.title}</a></td>
                    <td>{p.type}</td>
                    <td>{p.status === 'rent' ? 'Rent' : 'Sale'}</td>
                    <td>{Number(p.price).toLocaleString('en-US')}</td>
                    <td>{p.city}</td>
                    <td>
                      <button className="link-btn" onClick={() => startEdit(p)}>Edit</button>
                      <button className="link-btn danger" onClick={() => removeProperty(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)' }}>No properties yet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Property</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Message</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>{inq.created_at}</td>
                  <td>{inq.property_title || `#${inq.property_id}`}</td>
                  <td>{inq.name}</td>
                  <td>{inq.phone}</td>
                  <td>{inq.email || '—'}</td>
                  <td style={{ maxWidth: 260 }}>{inq.message || '—'}</td>
                  <td>
                    <button className="link-btn danger" onClick={() => removeInquiry(inq.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)' }}>No inquiries yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
