const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ── Generate ──────────────────────────────────────────────
export async function generate({ prompt, model, type, file }) {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('model', model);
  form.append('type', type);
  if (file) form.append('file', file);
  return request('/generate', { method: 'POST', body: form });
}

// ── Sessions ──────────────────────────────────────────────
export const getSessions    = ()   => request('/sessions');
export const getSession     = (id) => request(`/sessions/${id}`);
export const deleteSession  = (id) => request(`/sessions/${id}`, { method: 'DELETE' });

// ── Assets ────────────────────────────────────────────────
export const deleteAsset = (id) => request(`/assets/${id}`, { method: 'DELETE' });

// ── Settings ──────────────────────────────────────────────
export const getSettings = ()    => request('/settings');
export const saveSettings = (data) => request('/settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
