import React, { useState, useRef } from 'react';
import { generate } from '../lib/api.js';

const IMAGE_MODELS = [
  { id: 'grok-image',      label: 'Grok Imagine',     color: '#1A1A1A', credits: 4  },
  { id: 'seedream-5-lite', label: 'Seedream 5.0 Lite', color: '#4285F4', credits: 6  },
  { id: 'wan-25-image',    label: 'WAN 2.5',           color: '#0EA5E9', credits: 6  },
  { id: 'nano-banana-2',   label: 'Nano Banana 2',     color: '#F59E0B', credits: 8  },
  { id: 'nano-banana',     label: 'Nano Banana',       color: '#F97316', credits: 4  },
];

const VIDEO_MODELS = [
  { id: 'wan-27',       label: 'WAN 2.7',            color: '#0EA5E9', credits: 80 },
  { id: 'seedance-20',  label: 'Seedance 2.0',        color: '#10B981', credits: 78 },
  { id: 'seedance',     label: 'Seedance',            color: '#059669', credits: 50 },
  { id: 'veo3',         label: 'VEO 3.1',             color: '#4285F4', credits: 60 },
  { id: 'sora-2',       label: 'Sora 2',              color: '#1A1A1A', credits: 25 },
  { id: 'grok-imagine', label: 'Grok Imagine Video',  color: '#7C3AED', credits: 10 },
];

export default function GeneraPage() {
  const [type,    setType]    = useState('image');
  const [model,   setModel]   = useState('grok-image');
  const [prompt,  setPrompt]  = useState('');
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress,setProgress]= useState(0);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [saved,   setSaved]   = useState(false);
  const fileRef = useRef();
  const dropRef = useRef();

  const models = type === 'image' ? IMAGE_MODELS : VIDEO_MODELS;
  const selectedModel = models.find(m => m.id === model) ?? models[0];

  function handleTypeChange(t) {
    setType(t);
    const defaults = { image: 'grok-image', video: 'wan-27' };
    setModel(defaults[t]);
  }

  function handleFileSelect(f) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  async function handleGenerate() {
    if (!prompt.trim()) { setError('Scrivi una descrizione prima di generare'); return; }
    setError(''); setLoading(true); setResult(null); setSaved(false); setProgress(5);
    const isVideo = type === 'video';
    const iv = setInterval(() => setProgress(p => Math.min(p + (isVideo ? 1 : 5), 88)), isVideo ? 800 : 300);
    try {
      const res = await generate({ prompt: prompt.trim(), model: selectedModel.id, type, file });
      clearInterval(iv); setProgress(100);
      setTimeout(() => { setLoading(false); setResult(res); setProgress(0); }, 400);
    } catch (err) {
      clearInterval(iv); setLoading(false); setProgress(0); setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <aside style={{
        width: 320, minWidth: 280,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: 24, gap: 20, overflowY: 'auto',
      }}>

        {/* Tipo */}
        <div>
          <Label>Tipo</Label>
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 3, gap: 2, marginTop: 8 }}>
            {['image', 'video'].map(t => (
              <button key={t} onClick={() => handleTypeChange(t)} style={{
                flex: 1, padding: 7, borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: type === t ? 'var(--surface)' : 'transparent',
                color: type === t ? 'var(--text)' : 'var(--text-2)',
                boxShadow: type === t ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s',
              }}>
                {t === 'image' ? '🖼 Immagine' : '🎬 Video'}
              </button>
            ))}
          </div>
        </div>

        {/* File sorgente */}
        <div>
          <Label>Sorgente <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(opzionale)</span></Label>
          <div style={{ marginTop: 8 }}>
            {preview ? (
              <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={preview} alt="sorgente" style={{ width: '100%', display: 'block', maxHeight: 160, objectFit: 'cover' }} />
                <button onClick={clearFile} style={{
                  position: 'absolute', top: 7, right: 7,
                  background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                  borderRadius: '50%', width: 26, height: 26, fontSize: 13, cursor: 'pointer',
                }}>✕</button>
              </div>
            ) : (
              <div
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
                style={{
                  border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)',
                  padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 7, cursor: 'pointer', background: 'var(--bg)',
                }}
              >
                <div style={{ width: 38, height: 38, background: 'var(--surface2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
                <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>Trascina o clicca</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>PNG, JPG, WebP · max 20MB</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
            <button onClick={() => fileRef.current.click()} style={{
              marginTop: 8, width: '100%', background: 'var(--surface2)', color: 'var(--text)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 3h4l2 3h9a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
              </svg>
              Apri file
            </button>
          </div>
        </div>

        {/* Descrizione */}
        <div>
          <Label>Descrizione</Label>
          <textarea
            value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder={type === 'video'
              ? 'Descrivi il video da generare…\nEs. Una cascata nella foresta, slow motion'
              : 'Descrivi l\'immagine da generare…\nEs. Un bosco autunnale al tramonto, fotorealistico'}
            style={{
              marginTop: 8, width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
              padding: '11px 12px', fontSize: 13, color: 'var(--text)', background: 'var(--surface)',
              height: 96, outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Modello */}
        <div>
          <Label>Modello AI</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
            {models.map(m => (
              <button key={m.id} onClick={() => setModel(m.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 'var(--radius)',
                border: `1.5px solid ${selectedModel.id === m.id ? 'var(--accent)' : 'var(--border)'}`,
                background: selectedModel.id === m.id ? 'var(--accent-light)' : 'var(--surface)',
                cursor: 'pointer', transition: 'all 0.12s', textAlign: 'left',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: selectedModel.id === m.id ? 'var(--accent)' : 'var(--text)' }}>
                  {m.label}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>
                  {m.credits} cr
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Errore */}
        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: 12, lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* Genera */}
        <button onClick={handleGenerate} disabled={loading} style={{
          background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-lg)',
          padding: 14, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(109,74,255,0.3)', transition: 'all 0.2s',
          opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? <><Spinner /> {type === 'video' ? 'Generazione video…' : 'Generazione…'}</> : (
            <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Genera</>
          )}
        </button>

        {type === 'video' && loading && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5 }}>
            I video richiedono 1–3 minuti.<br/>Attendi senza chiudere la pagina.
          </div>
        )}
      </aside>

      {/* ── RIGHT PANEL ── */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, overflow: 'auto', gap: 20 }}>

        {/* Progress */}
        {loading && progress > 0 && (
          <div style={{ width: '100%', maxWidth: 520 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
              Generazione con {selectedModel.label}… ({selectedModel.credits} crediti)
            </div>
            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && (
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <div style={{
              width: 72, height: 72, background: 'var(--surface)', borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: 'var(--shadow-sm)',
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="4"/>
                <path d="M3 16l5-5 4 4 3-3 5 5"/>
                <circle cx="8" cy="9" r="1.5" fill="var(--text-3)" stroke="none"/>
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Pronto a creare</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Scegli un modello, scrivi una descrizione<br/>e premi Genera.
            </div>
          </div>
        )}

        {/* Risultato */}
        {result && !loading && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow)', overflow: 'hidden', maxWidth: 520, width: '100%' }}>
            <div style={{ background: 'var(--surface2)', position: 'relative' }}>
              {result.asset.type === 'video' ? (
                <video src={result.asset.dataUrl} controls style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'contain' }} />
              ) : (
                <img src={result.asset.dataUrl} alt="Risultato" style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'contain' }} />
              )}
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                color: 'white', fontSize: 10, fontWeight: 700,
                padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                {selectedModel.label}
              </div>
            </div>
            <div style={{ padding: '8px 16px', color: 'var(--text-3)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {new Date().toLocaleString('it-IT', { dateStyle: 'long', timeStyle: 'short' })}
            </div>
            {!saved ? (
              <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button onClick={() => setSaved(true)} style={{
                  flex: 1, background: 'var(--accent)', color: 'white', border: 'none',
                  borderRadius: 'var(--radius)', padding: 11, fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Salva nell'archivio
                </button>
                <button onClick={() => setResult(null)} style={{
                  background: 'transparent', color: 'var(--danger)', border: '1.5px solid var(--danger-light)',
                  borderRadius: 'var(--radius)', padding: '11px 16px', fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                  Elimina
                </button>
              </div>
            ) : (
              <div style={{ margin: '0 16px 16px', background: '#D1FAE5', color: 'var(--success)', borderRadius: 'var(--radius)', padding: 11, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                ✓ Salvata nell'archivio
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Label({ children }) {
  return <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{children}</span>;
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
