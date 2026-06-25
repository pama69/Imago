/**
 * Servizio Gemini (Google)
 * Usa l'API Gemini Imagen per text-to-image e image-to-image.
 * Documentazione: https://ai.google.dev/gemini-api/docs/image-generation
 */

export async function generateWithGemini({ prompt, type, sourceBase64, sourceMime }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Chiave API Gemini non configurata');

  if (type === 'video') {
    throw new Error('Gemini non supporta ancora la generazione video — usa Seedance');
  }

  // Prepara i parts del prompt
  const parts = [];

  if (sourceBase64) {
    parts.push({
      inline_data: { mime_type: sourceMime, data: sourceBase64 }
    });
  }

  parts.push({ text: prompt });

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  };

  const model = 'gemini-2.0-flash-preview-image-generation';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Gemini error ${resp.status}: ${err?.error?.message || resp.statusText}`);
  }

  const data = await resp.json();
  const candidate = data.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(p => p.inline_data?.mime_type?.startsWith('image/'));

  if (!imagePart) throw new Error('Gemini non ha restituito immagini');

  const { mime_type, data: imgData } = imagePart.inline_data;
  return `data:${mime_type};base64,${imgData}`;
}
