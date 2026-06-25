import { Router } from 'express';
import multer from 'multer';
import { Session } from '../models/Session.js';
import { Asset } from '../models/Asset.js';
import { generateWithKlifgen, KLIFGEN_MODELS } from '../services/klifgen.js';

export const generateRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// GET /api/generate/models — lista modelli disponibili
generateRouter.get('/models', (_req, res) => {
  res.json(KLIFGEN_MODELS);
});

/**
 * POST /api/generate
 * multipart/form-data:
 *   prompt     string   testo descrittivo
 *   model      string   id modello (es. grok-image, wan-27)
 *   file?      File     immagine sorgente (opzionale)
 *   imageUrl?  string   URL immagine sorgente alternativo
 */
generateRouter.post('/', upload.single('file'), async (req, res) => {
  const { prompt, model, imageUrl } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt mancante' });
  if (!model)  return res.status(400).json({ error: 'Modello mancante' });

  const modelInfo = KLIFGEN_MODELS[model];
  if (!modelInfo) return res.status(400).json({ error: `Modello "${model}" non riconosciuto` });

  try {
    // 1. Crea sessione
    const session = await Session.create({
      prompt,
      model,
      type: modelInfo.type,
    });

    // 2. Salva immagine sorgente (se caricata)
    let sourceAsset = null;
    if (req.file) {
      const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      sourceAsset = await Asset.create({
        session:  session._id,
        role:     'source',
        type:     'image',
        dataUrl,
        mimeType: req.file.mimetype,
        size:     req.file.size,
      });
      session.sourceAsset = sourceAsset._id;
      await session.save();
    }

    // 3. Chiama KLIFGEN
    const resultDataUrl = await generateWithKlifgen({
      model,
      prompt,
      sourceBuffer: req.file?.buffer   || null,
      sourceMime:   req.file?.mimetype || null,
      imageUrl:     imageUrl           || null,
    });

    // 4. Salva risultato
    const mime = modelInfo.type === 'video' ? 'video/mp4' : 'image/png';
    const generated = await Asset.create({
      session:  session._id,
      role:     'generated',
      type:     modelInfo.type,
      dataUrl:  resultDataUrl,
      mimeType: mime,
      model,
      prompt,
    });

    // 5. Aggiorna sessione
    session.assetCount = 1;
    session.thumbnail  = generated._id.toString();
    await session.save();

    res.json({ sessionId: session._id, asset: generated });

  } catch (err) {
    console.error('Errore generazione:', err);
    res.status(500).json({ error: err.message });
  }
});
