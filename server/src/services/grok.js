/**
 * Servizio Grok (xAI)
 * Usa l'API xAI per generazione immagini (aurora model).
 * Documentazione: https://docs.x.ai/docs/guides/image-generations
 */

export async function generateWithGrok({ prompt, type, sourceBase64, sourceMime }) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error('Chiave API Grok non configurata');

  if (type === 'video') {
    throw new Error('Grok non supporta la generazione video — usa Seedance');
  }

  const body = {
    model: 'aurora',
    prompt,
    n: 1,
    response_format: 'b64_json',
  };

  const resp = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Grok error ${resp.status}: ${err?.error?.message || resp.statusText}`);
  }

  const data = await resp.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('Grok non ha restituito immagini');

  return `data:image/png;base64,${b64}`;
}
