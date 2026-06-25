import React, { useState, useEffect } from 'react';
import { getSessions, getSession, deleteSession } from '../lib/api.js';

export default function ArchivioPage() {
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null); // sessione aperta
  const [detail,    setDetail]    = useState(null);  // { ...session, assets }
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function openSession(s) {
    setSelected(s);
    setDetail(null);
    try {
      const d = await getSession(s._id);
      setDetail(d);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s._id !== id));
      setSelected(null);
      setDetail(null);
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  }

  if (loading) return <PageCenter><Spinner /> Caricamento archivio…</PageCenter>;

  if (sessions.length === 0) return (
    <PageCenter>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, background: 'var(--surface)', borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: 'var(--shadow-sm)',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
            <path d="M5 3h4l2 3h9a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Archivio vuoto</div>
        <div style={{ color: 'var(--text-2)', fontSize: 13 }}>Genera la tua prima immagine e salvala qui.</div>
      </div>
    </PageCenter>
  );

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* Griglia sessioni */}
      <div style={{
        flex: selected ? '0 0 340px' : 1,
        overflowY: 'auto',
        padding: 28,
        transition: 'flex 0.2s',
      }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>Archivio</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 2 }}>
            {sessions.length} sessioni
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: selected ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 14,
        }}>
          {sessions.map(s => (
            <SessionCard
              key={s._id}
              session={s}
              active={selected?._id === s._id}
              onClick={() => openSession(s)}
            />
          ))}
        </div>
      </div>

      {/* Pannello dettaglio */}
      {selected && (
        <div style={{
          flex: 1,
          borderLeft: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <button onClick={() => { setSelected(null); setDetail(null); }} style={{
              background: 'var(--surface2)', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '6px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer',
            }}>← Indietro</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                {selected.prompt.length > 60 ? selected.prompt.slice(0, 60) + '…' : selected.prompt}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                {new Date(selected.createdAt).toLocaleString('it-IT')} · {selected.model}
              </div>
            </div>
            <button
              onClick={() => handleDelete(selected._id)}
              disabled={deleting}
              style={{
                background: 'transparent', color: 'var(--danger)',
                border: '1.5px solid var(--danger-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                opacity: deleting ? 0.5 : 1,
              }}
            >
              {deleting ? 'Eliminazione…' : 'Elimina sessione'}
            </button>
          </div>

          {/* Assets */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {!detail ? (
              <PageCenter><Spinner /> Caricamento…</PageCenter>
            ) : (
              <div>
                {/* Sorgente */}
                {detail.assets.filter(a => a.role === 'source').length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <SectionLabel>Immagine sorgente</SectionLabel>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                      {detail.assets.filter(a => a.role === 'source').map(a => (
                        <AssetThumb key={a._id} asset={a} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Generati */}
                <SectionLabel>Generati ({detail.assets.filter(a => a.role === 'generated').length})</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginTop: 8 }}>
                  {detail.assets.filter(a => a.role === 'generated').map(a => (
                    <AssetThumb key={a._id} asset={a} large />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, active, onClick }) {
  const MODEL_COLORS = { gemini: '#4285F4', grok: '#1A1A1A', seedance: '#10B981' };

  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      overflow: 'hidden',
      cursor: 'pointer',
      boxShadow: active ? '0 0 0 3px var(--accent-light)' : 'var(--shadow-sm)',
      transition: 'all 0.15s',
    }}>
      {/* Thumbnail placeholder */}
      <div style={{
        height: 120,
        background: `linear-gradient(135deg, ${MODEL_COLORS[session.model] || '#6D4AFF'}22, ${MODEL_COLORS[session.model] || '#6D4AFF'}55)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M3 16l5-5 4 4 3-3 5 5"/>
          <circle cx="8" cy="9" r="1.5" fill="white" stroke="none"/>
        </svg>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {session.prompt}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {new Date(session.createdAt).toLocaleDateString('it-IT')}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: MODEL_COLORS[session.model] || 'var(--accent)',
            background: (MODEL_COLORS[session.model] || 'var(--accent)') + '18',
            padding: '2px 7px', borderRadius: 20,
          }}>
            {session.model}
          </span>
        </div>
      </div>
    </div>
  );
}

function AssetThumb({ asset, large }) {
  const size = large ? 160 : 80;
  if (asset.type === 'video') {
    return (
      <video src={asset.dataUrl} controls style={{
        width: '100%', height: large ? 140 : 80,
        objectFit: 'cover', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
      }} />
    );
  }
  return (
    <img src={asset.dataUrl} alt="" style={{
      width: large ? '100%' : size,
      height: large ? 140 : size,
      objectFit: 'cover',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      display: 'block',
    }} />
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>;
}

function PageCenter({ children }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-2)' }}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
