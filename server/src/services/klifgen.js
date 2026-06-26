/**
 * Servizio KLIFGEN — aggregatore AI per immagini e video
 * Docs: https://klifgen.app/profile
 *
 * AUTH: username + secret_key (form-encoded) in ogni richiesta
 *
 * MODELLI IMMAGINE (sync — restituiscono URL direttamente):
 *   grok-image       → /request-grok-imagine-image  (4 cr)
 *   seedream-5-lite  → /request-seedream-5-lite      (6 cr)
 *   wan-25-image     → /request-wan-2-5-image        (6 cr)
 *   nano-banana-2    → /request-nano-banana-2        (var)
 *   nano-banana      → /request-nano-banana          (var)
 *
 * MODELLI VIDEO (async — submit → polling /query-status):
 *   wan-27           → /request-wan-2-7
 *   seedance-20      → /request-seedance-2-0
 *   seedance         → /request-seedance
 *   veo3             → /request-veo3
 *   sora-2           → /request-sora-2
 *   grok-imagine     → /request-grok-imagine
 */

const BASE = 'https://klifgen.app';
const POLL_INTERVAL = 4000;   // ms tra un poll e l'altro
const POLL_TIMEOUT  = 180000; // 3 minuti max

function creds() {
  const username   = process.env.KLIFGEN_USERNAME;
  const secret_key = process.env.KLIFGEN_SECRET_KEY;
  if (!username || !secret_key) throw new Error('Credenziali KLIFGEN non configurate (KLIFGEN_USERNAME / KLIFGEN_SECRET_KEY)');
  return { username, secret_key };
}

// ─────────────────────────────────────────────
// POST form-encoded (per le API senza file)
// ─────────────────────────────────────────────
async function postForm(endpoint, params) {
  const body = new URLSearchParams(params);
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(`KLIFGEN ${endpoint} error: ${json.message || json.error || res.statusText}`);
  }
  return json;
}

// ─────────────────────────────────────────────
// POST multipart (per Grok Imagine Image con file)
// ─────────────────────────────────────────────
async function postMultipart(endpoint, fields, fileBuffer, fileMime) {
  const { FormData, Blob } = await import('node:buffer').then(() => globalThis);

  // Usa il built-in FormData di Node 18+
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  if (fileBuffer) {
    const blob = new Blob([fileBuffer], { type: fileMime });
    form.append('image_file', blob, 'source.' + (fileMime?.split('/')[1] || 'jpg'));
  }

  const res = await fetch(`${BASE}/${endpoint}`, { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(`KLIFGEN ${endpoint} error: ${json.message || json.error || res.statusText}`);
  }
  return json;
}

// ─────────────────────────────────────────────
// Polling asincrono per i modelli video
// ─────────────────────────────────────────────
async function pollStatus(taskId) {
  const { username, secret_key } = creds();
  const deadline = Date.now() + POLL_TIMEOUT;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL);
    const url = `${BASE}/query-status?username=${encodeURIComponent(username)}&secret_key=${encodeURIComponent(secret_key)}&task_id=${encodeURIComponent(taskId)}`;
    const res  = await fetch(url);
    const json = await res.json().catch(() => ({}));

    if (json.status === 'completed' || json.status === 'succeeded') {
      console.log('[KLIFGEN] task completato, risposta:', JSON.stringify(json));
      const fileUrl = json.output_url || json.video_url || json.image_url || json.url
        || json.result_url || json.file_url || json.media_url
        || (Array.isArray(json.output) ? json.output[0] : null)
        || (Array.isArray(json.images) ? json.images[0] : null);
      if (!fileUrl) throw new Error(`KLIFGEN: task completato ma URL mancante — campi ricevuti: ${Object.keys(json).join(', ')}`);
      return fileUrl;
    }
    if (json.status === 'failed' || json.status === 'error') {
      throw new Error(`KLIFGEN task fallito: ${json.message || json.error || 'errore sconosciuto'}`);
    }
    // status === 'processing' | 'pending' → continua
  }
  throw new Error('KLIFGEN: timeout superato (3 min)');
}

// ─────────────────────────────────────────────
// Scarica URL e converte in dataUrl base64
// ─────────────────────────────────────────────
async function urlToDataUrl(url, mimeHint) {
  const res  = await fetch(url);
  const buf  = Buffer.from(await res.arrayBuffer());
  const mime = mimeHint || res.headers.get('content-type') || 'image/png';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════════════
// MODELLI IMMAGINE (sync)
// ═══════════════════════════════════════════════

async function grokImage({ prompt, sourceBuffer, sourceMime, imageUrl }) {
  const { username, secret_key } = creds();
  const hasImage = !!(sourceBuffer || imageUrl);
  let json;

  if (hasImage && sourceBuffer) {
    // multipart con file
    json = await postMultipart('request-grok-imagine-image', {
      username, secret_key, prompt,
      has_image: '1',
      aspect_ratio: '1:1',
    }, sourceBuffer, sourceMime);
  } else {
    json = await postForm('request-grok-imagine-image', {
      username, secret_key, prompt,
      aspect_ratio: '1:1',
      ...(imageUrl ? { has_image: '1', image_url: imageUrl } : {}),
    });
  }

  const resultUrl = json.image_url || json.url || json.output_url;
  if (!resultUrl) throw new Error('Grok Imagine: nessun URL restituito');
  return urlToDataUrl(resultUrl, 'image/png');
}

async function seedream5lite({ prompt, imageUrl }) {
  const { username, secret_key } = creds();

  const body = new URLSearchParams({
    username, secret_key, prompt,
    aspect_ratio: '1:1',
    quality: 'high',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  });

  const res = await fetch(`${BASE}/request-seedream-5-lite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));

  // Risposta asincrona: l'API restituisce un task_id da fare polling
  if (json.task_id) {
    const url = await pollStatus(json.task_id);
    return urlToDataUrl(url, 'image/png');
  }

  // Risposta sincrona: URL diretto
  const resultUrl = json.image_url || json.url || json.output_url;
  if (resultUrl) return urlToDataUrl(resultUrl, 'image/png');

  throw new Error(`KLIFGEN request-seedream-5-lite error: ${json.message || json.error || res.statusText}`);
}

async function wan25image({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-wan-2-5-image', {
    username, secret_key, prompt,
    size: '1:1',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  });
  const resultUrl = json.image_url || json.url || json.output_url;
  if (!resultUrl) throw new Error('WAN 2.5 Image: nessun URL restituito');
  return urlToDataUrl(resultUrl, 'image/png');
}

async function nanoBanana2({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-nano-banana-2', {
    username, secret_key, prompt,
    resolution: '1K',
    aspect_ratio: '1:1',
    ...(imageUrl ? { has_image: '1', image_url: imageUrl } : {}),
  });
  const resultUrl = json.image_url || json.url || json.output_url;
  if (!resultUrl) throw new Error('Nano Banana 2: nessun URL restituito');
  return urlToDataUrl(resultUrl, 'image/png');
}

async function nanoBanana({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-nano-banana', {
    username, secret_key, prompt,
    output_format: 'png',
    image_size: '1:1',
    ...(imageUrl ? { has_image: '1', image_url: imageUrl } : {}),
  });
  const resultUrl = json.image_url || json.url || json.output_url;
  if (!resultUrl) throw new Error('Nano Banana: nessun URL restituito');
  return urlToDataUrl(resultUrl, 'image/png');
}

// ═══════════════════════════════════════════════
// MODELLI VIDEO (async)
// ═══════════════════════════════════════════════

async function wan27({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-wan-2-7', {
    username, secret_key, prompt,
    resolution: '720p', duration: '5', aspect_ratio: '16:9',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  });
  const taskId = json.task_id;
  if (!taskId) throw new Error('WAN 2.7: nessun task_id');
  const url = await pollStatus(taskId);
  return urlToDataUrl(url, 'video/mp4');
}

async function seedance20({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-seedance-2-0', {
    username, secret_key, prompt,
    variant: 'fast', resolution: '720p', duration: '5', aspect_ratio: '16:9',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  });
  const taskId = json.task_id;
  if (!taskId) throw new Error('Seedance 2.0: nessun task_id');
  const url = await pollStatus(taskId);
  return urlToDataUrl(url, 'video/mp4');
}

async function seedance({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-seedance', {
    username, secret_key, prompt,
    model: 'lite', resolution: '720p', duration: '5', aspect_ratio: '16:9',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  });
  const taskId = json.task_id;
  if (!taskId) throw new Error('Seedance: nessun task_id');
  const url = await pollStatus(taskId);
  return urlToDataUrl(url, 'video/mp4');
}

async function veo3({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-veo3', {
    username, secret_key, prompt,
    model: 'veo3_fast', resolution: '720p', aspect_ratio: '16:9',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  });
  const taskId = json.task_id;
  if (!taskId) throw new Error('VEO 3.1: nessun task_id');
  const url = await pollStatus(taskId);
  return urlToDataUrl(url, 'video/mp4');
}

async function sora2({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-sora-2', {
    username, secret_key, prompt,
    aspect_ratio: '16:9', n_frames: '10',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  });
  const taskId = json.task_id;
  if (!taskId) throw new Error('Sora 2: nessun task_id');
  const url = await pollStatus(taskId);
  return urlToDataUrl(url, 'video/mp4');
}

async function grokImagineVideo({ prompt, imageUrl }) {
  const { username, secret_key } = creds();
  const json = await postForm('request-grok-imagine', {
    username, secret_key, prompt,
    resolution: '720p', duration: '6', aspect_ratio: '16:9',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  });
  const taskId = json.task_id;
  if (!taskId) throw new Error('Grok Imagine Video: nessun task_id');
  const url = await pollStatus(taskId);
  return urlToDataUrl(url, 'video/mp4');
}

// ═══════════════════════════════════════════════
// Export principale
// ═══════════════════════════════════════════════

export const KLIFGEN_MODELS = {
  // IMMAGINI
  'grok-image':      { label: 'Grok Imagine',      type: 'image', credits: 4  },
  'seedream-5-lite': { label: 'Seedream 5.0 Lite',  type: 'image', credits: 6  },
  'wan-25-image':    { label: 'WAN 2.5 Image',      type: 'image', credits: 6  },
  'nano-banana-2':   { label: 'Nano Banana 2',      type: 'image', credits: 8  },
  'nano-banana':     { label: 'Nano Banana',        type: 'image', credits: 4  },
  // VIDEO
  'wan-27':          { label: 'WAN 2.7',            type: 'video', credits: 80 },
  'seedance-20':     { label: 'Seedance 2.0',       type: 'video', credits: 78 },
  'seedance':        { label: 'Seedance',           type: 'video', credits: 50 },
  'veo3':            { label: 'VEO 3.1',            type: 'video', credits: 60 },
  'sora-2':          { label: 'Sora 2',             type: 'video', credits: 25 },
  'grok-imagine':    { label: 'Grok Imagine Video', type: 'video', credits: 10 },
};

export async function generateWithKlifgen({ model, prompt, sourceBuffer, sourceMime, imageUrl }) {
  const params = { prompt, sourceBuffer, sourceMime, imageUrl };
  switch (model) {
    // Immagini
    case 'grok-image':      return grokImage(params);
    case 'seedream-5-lite': return seedream5lite(params);
    case 'wan-25-image':    return wan25image(params);
    case 'nano-banana-2':   return nanoBanana2(params);
    case 'nano-banana':     return nanoBanana(params);
    // Video
    case 'wan-27':          return wan27(params);
    case 'seedance-20':     return seedance20(params);
    case 'seedance':        return seedance(params);
    case 'veo3':            return veo3(params);
    case 'sora-2':          return sora2(params);
    case 'grok-imagine':    return grokImagineVideo(params);
    default:
      throw new Error(`Modello KLIFGEN sconosciuto: "${model}"`);
  }
}
