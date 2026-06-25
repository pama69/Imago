import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../lib/api.js';

export default function ImpostazioniPage() {
  const [settings, setSettings] = useState({});
  const [username, setUsername] = useState('');
  const [key,      setKey]      = useState('');
  const [showKey,  setShowKey]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    getSettings().then(s => { setSettings(s); setUsername(s.klifgenUsername || ''); }).catch(console.error);
  }, []);

  async function handleSave() {
    if (!username.trim()) { setError('Inserisci il tuo username KLIFGEN'); return; }
    setSaving(true); setError('');
    try {
      const payload = { klifgenUsername: username.trim() };
      if (key.trim()) payload.klifgenKey = key.trim();
      await saveSettings(payload);
      const updated = await getSettings();
      setSettings(updated);
      setKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: 32, overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>Impostazioni</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 2 }}>Credenziali KLIFGEN per la generazione AI</p>
      </div>

      {/* Card KLIFGEN */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 20 }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>KLIFGEN</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Aggregatore AI · <a href="https://klifgen.app/profile" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>klifgen.app/profile</a>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: settings.hasKey ? 'var(--success)' : 'var(--border-strong)' }} />
            <span style={{ fontSize: 11, color: settings.hasKey ? 'var(--success)' : 'var(--text-3)', fontWeight: 600 }}>
              {settings.hasKey ? 'Configurato' : 'Non configurato'}
            </span>
          </div>
        </div>

        {/* Username */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
            Username KLIFGEN
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Il tuo username su klifgen.app"
            style={{
              width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
              padding: '9px 12px', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Secret key */}
        <div style={{ padding: '16px 20px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
            API Secret Key
            {settings.hasKey && <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 8 }}>attuale: {settings.keyPreview}</span>}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder={settings.hasKey ? 'Lascia vuoto per mantenere la chiave attuale' : 'Incolla la tua secret_key da klifgen.app/profile'}
              style={{
                width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '9px 38px 9px 12px', fontSize: 13,
                fontFamily: key ? "'SF Mono','Fira Mono',monospace" : 'inherit',
                background: 'var(--bg)', color: 'var(--text)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={() => setShowKey(p => !p)} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14,
            }}>
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.5 }}>
            Trovi la chiave in <strong>klifgen.app/profile → API Key</strong>
          </p>
        </div>
      </div>

      {/* Modelli disponibili */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13 }}>
          Modelli disponibili
        </div>
        <div style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: '🖼 Immagini', models: ['Grok Imagine', 'Seedream 5.0 Lite', 'WAN 2.5', 'Nano Banana 2', 'Nano Banana'] },
            { label: '🎬 Video',    models: ['WAN 2.7', 'Seedance 2.0', 'Seedance', 'VEO 3.1', 'Sora 2', 'Grok Imagine Video'] },
          ].map(group => (
            <div key={group.label}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {group.label}
              </div>
              {group.models.map(m => (
                <div key={m} style={{ fontSize: 12, color: 'var(--text-2)', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                  {m}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Errore */}
      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Salva */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={handleSave} disabled={saving} style={{
          background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)',
          padding: '11px 28px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1, boxShadow: '0 4px 12px rgba(109,74,255,0.25)',
        }}>
          {saving ? 'Salvataggio…' : 'Salva'}
        </button>
        {saved && <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 13 }}>✓ Salvato</span>}
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
        Le credenziali vengono salvate nel tuo MongoDB Atlas e usate esclusivamente per le chiamate API di generazione.
      </p>
    </div>
  );
}
