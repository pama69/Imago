import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../lib/api.js';

const MODELS = [
  {
    id: 'gemini',
    label: 'Google Gemini',
    desc: 'Generazione immagini · gemini-2.0-flash-preview-image-generation',
    color: '#4285F4',
    field: 'geminiKey',
    hasField: 'hasGemini',
    placeholder: 'AIzaSy••••••••••••••••',
    docsUrl: 'https://aistudio.google.com/apikey',
  },
  {
    id: 'grok',
    label: 'Grok (xAI)',
    desc: 'Generazione immagini · aurora',
    color: '#1A1A1A',
    field: 'grokKey',
    hasField: 'hasGrok',
    placeholder: 'xai-••••••••••••••••',
    docsUrl: 'https://console.x.ai',
  },
  {
    id: 'seedance',
    label: 'Seedance (ByteDance)',
    desc: 'Immagini e video generativi · seedance-1',
    color: '#10B981',
    field: 'seedanceKey',
    hasField: 'hasSeedance',
    placeholder: 'sd-••••••••••••••••',
    docsUrl: 'https://platform.volcengine.com',
  },
];

export default function ImpostazioniPage() {
  const [settings, setSettings] = useState({});
  const [keys,     setKeys]     = useState({ geminiKey: '', grokKey: '', seedanceKey: '' });
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');
  const [show,     setShow]     = useState({});

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      // Invia solo i campi compilati
      const payload = {};
      if (keys.geminiKey.trim())   payload.geminiKey   = keys.geminiKey.trim();
      if (keys.grokKey.trim())     payload.grokKey     = keys.grokKey.trim();
      if (keys.seedanceKey.trim()) payload.seedanceKey = keys.seedanceKey.trim();
      await saveSettings(payload);
      setSaved(true);
      setKeys({ geminiKey: '', grokKey: '', seedanceKey: '' });
      const updated = await getSettings();
      setSettings(updated);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 32, overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>Impostazioni</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 2 }}>Chiavi API per i modelli AI</p>
      </div>

      {/* Sezione chiavi */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          fontWeight: 600,
          fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
          Chiavi API
        </div>

        {MODELS.map((m, i) => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px',
            borderBottom: i < MODELS.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            {/* Icona */}
            <div style={{
              width: 34, height: 34,
              background: m.color,
              borderRadius: 9,
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{m.desc}</div>
            </div>

            {/* Input chiave */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input
                type={show[m.id] ? 'text' : 'password'}
                value={keys[m.field]}
                onChange={e => setKeys(prev => ({ ...prev, [m.field]: e.target.value }))}
                placeholder={settings[m.hasField] ? '••••••••••••' : m.placeholder}
                style={{
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '7px 32px 7px 10px',
                  fontSize: 12,
                  fontFamily: "'SF Mono', 'Fira Mono', monospace",
                  width: 200,
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button onClick={() => setShow(p => ({ ...p, [m.id]: !p[m.id] }))} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0,
              }}>
                {show[m.id] ? '🙈' : '👁'}
              </button>
            </div>

            {/* Status */}
            <div style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: settings[m.hasField] ? 'var(--success)' : 'var(--border-strong)',
              flexShrink: 0,
              title: settings[m.hasField] ? 'Configurata' : 'Non configurata',
            }} title={settings[m.hasField] ? 'Chiave configurata' : 'Chiave mancante'} />

            {/* Docs link */}
            <a href={m.docsUrl} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 11, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0,
            }}>
              Ottieni chiave →
            </a>
          </div>
        ))}
      </div>

      {/* Errore */}
      {error && (
        <div style={{
          background: 'var(--danger-light)', color: 'var(--danger)',
          borderRadius: 'var(--radius)', padding: '10px 14px',
          fontSize: 12, marginBottom: 16,
        }}>{error}</div>
      )}

      {/* Salva */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={handleSave} disabled={saving} style={{
          background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: 'var(--radius)',
          padding: '11px 24px', fontSize: 13, fontWeight: 700,
          opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(109,74,255,0.25)',
        }}>
          {saving ? 'Salvataggio…' : 'Salva chiavi'}
        </button>
        {saved && <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 13 }}>✓ Salvate</span>}
      </div>

      {/* Nota privacy */}
      <p style={{ marginTop: 16, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
        Le chiavi API vengono salvate nel tuo database MongoDB Atlas e usate esclusivamente per le richieste di generazione.
        Non vengono mai condivise con terze parti.
      </p>
    </div>
  );
}
