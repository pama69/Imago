import React from 'react';

const TABS = [
  { id: 'genera',       label: 'Genera' },
  { id: 'archivio',     label: 'Archivio' },
  { id: 'impostazioni', label: 'Impostazioni' },
];

export default function TopNav({ current, onChange }) {
  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      height: 52,
      boxShadow: 'var(--shadow-sm)',
      flexShrink: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 32 }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--accent)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <path d="M3 16l5-5 4 4 3-3 5 5"/>
            <circle cx="8.5" cy="9" r="1.5" fill="white" stroke="none"/>
          </svg>
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--accent)' }}>
          Imago
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: current === t.id ? 'var(--accent-light)' : 'transparent',
              color: current === t.id ? 'var(--accent)' : 'var(--text-2)',
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
