/**
 * Servizio Seedance (ByteDance)
 * Supporta sia generazione video che immagini.
 * Documentazione: https://platform.volcengine.com/docs/82379
 *
 * NOTA: Seedance usa un modello asincrono (submit → poll → result).
 * Per semplicità implementiamo il polling lato server con timeout 120s.
 */

const SEEDANCE_API = 'https://visual.volcengineapi.com';

export async function generateWithSeedance({ prompt, type, sourceBase64, sourceMime }) {
  const apiKey = process.env.SEEDANCE_API_KEY;
  if (!apiKey) throw new Error('Chiave API Seedance non configurata');

  // Seedance può generare sia immagini che video
  const model = type === 'video' ? 'seedance-1-lite' : 'seedance-1-pro';

  const body = {
    model,
    prompt,
    ...(sourceBase64 ? { image: sourceBase64 } : {}),
  };

  // Submit task
  const submitResp = await fetch(`${SEEDANCE_API}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!submitResp.ok) {
    const err = await submitResp.json().catch(() => ({}));
    throw new Error(`Seedance submit error ${submitResp.status}: ${err?.message || submitResp.statusText}`);
  }

  const { task_id } = await submitResp.json();
  if (!task_id) throw new Error('Seedance non ha restituito un task_id');

  // Poll finché completato
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await sleep(3000);

    const pollResp = await fetch(`${SEEDANCE_API}/query?task_id=${task_id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    const result = await pollResp.json();

    if (result.status === 'succeeded') {
      // Restituisce URL o base64 a seconda del modello
      if (result.output?.url) {
        // Scarica e converti in base64
        const fileResp = await fetch(result.output.url);
        const buffer = Buffer.from(await fileResp.arrayBuffer());
        const mime = type === 'video' ? 'video/mp4' : 'image/png';
        return `data:${mime};base64,${buffer.toString('base64')}`;
      }
      if (result.output?.b64) {
        const mime = type === 'video' ? 'video/mp4' : 'image/png';
        return `data:${mime};base64,${result.output.b64}`;
      }
      throw new Error('Seedance succeeded ma nessun output trovato');
    }

    if (result.status === 'failed') {
      throw new Error(`Seedance task fallito: ${result.error || 'errore sconosciuto'}`);
    }
    // status === 'running' → continua polling
  }

  throw new Error('Seedance timeout: generazione troppo lunga (>120s)');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
