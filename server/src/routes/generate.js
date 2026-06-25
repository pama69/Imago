import { Router } from 'express';
import multer from 'multer';
import { Session } from '../models/Session.js';
import { Asset } from '../models/Asset.js';
import { generateWithGemini } from '../services/gemini.js';
import { generateWithGrok } from '../services/grok.js';
import { generateWithSeedance } from '../services/seedance.js';

export const generateRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

/**
 * POST /api/generate
 * Body (multipart/form-data):
 *   prompt    string    testo descrittivo
 *   model     string    gemini | grok | seedance
 *   type      string    image | video
 *   file?     File      immagine sorgente (opzionale, per img-to-img)
 */
generateRouter.post('/', upload.single('file'), async (req, res) => {
  const { prompt, model, type = 'image' } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt mancante' });
  if (!model)  return res.status(400).json({ error: 'Modello mancante' });

  try {
    // 1. Crea sessione
    const session = await Session.create({ prompt, model, type });

    let sourceAsset = null;

    // 2. Salva immagine sorgente (se fornita)
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

    // 3. Chiama il servizio AI
    const sourceBase64 = req.file ? req.file.buffer.toString('base64') : null;
    const sourceMime   = req.file ? req.file.mimetype : null;

    let resultDataUrl;
    switch (model) {
      case 'gemini':
        resultDataUrl = await generateWithGemini({ prompt, type, sourceBase64, sourceMime });
        break;
      case 'grok':
        resultDataUrl = await generateWithGrok({ prompt, type, sourceBase64, sourceMime });
        break;
      case 'seedance':
        resultDataUrl = await generateWithSeedance({ prompt, type, sourceBase64, sourceMime });
        break;
      default:
        return res.status(400).json({ error: `Modello "${model}" non supportato` });
    }

    // 4. Salva il risultato
    const generated = await Asset.create({
      session:  session._id,
      role:     'generated',
      type,
      dataUrl:  resultDataUrl,
      mimeType: type === 'video' ? 'video/mp4' : 'image/png',
      model,
      prompt,
    });

    // 5. Aggiorna sessione
    session.assetCount = 1;
    session.thumbnail  = generated._id.toString();
    await session.save();

    res.json({
      sessionId: session._id,
      asset:     generated,
    });

  } catch (err) {
    console.error('Errore generazione:', err);
    res.status(500).json({ error: err.message });
  }
});
