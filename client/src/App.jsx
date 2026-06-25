import React, { useState } from 'react';
import TopNav from './components/TopNav.jsx';
import GeneraPage from './pages/GeneraPage.jsx';
import ArchivioPage from './pages/ArchivioPage.jsx';
import ImpostazioniPage from './pages/ImpostazioniPage.jsx';

export default function App() {
  const [page, setPage] = useState('genera');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopNav current={page} onChange={setPage} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {page === 'genera'        && <GeneraPage />}
        {page === 'archivio'      && <ArchivioPage />}
        {page === 'impostazioni'  && <ImpostazioniPage />}
      </main>
    </div>
  );
}
