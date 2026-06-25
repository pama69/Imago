import { Router } from 'express';
import multer from 'multer';
import { Asset } from '../models/Asset.js';
import { Session } from '../models/Session.js';

export const assetsRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/assets/upload — carica immagine sorgente
assetsRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nessun file' });

    const { sessionId } = req.body;
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const asset = await Asset.create({
      session:  sessionId,
      role:     'source',
      type:     req.file.mimetype.startsWith('video') ? 'video' : 'image',
      dataUrl,
      mimeType: req.file.mimetype,
      size:     req.file.size,
    });

    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/assets/:id — elimina singolo asset
assetsRouter.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset non trovato' });

    // Aggiorna contatore sessione
    await Session.findByIdAndUpdate(asset.session, { $inc: { assetCount: -1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/assets/:id/data — restituisce il file binario (da dataUrl)
assetsRouter.get('/:id/data', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).select('dataUrl mimeType');
    if (!asset || !asset.dataUrl) return res.status(404).json({ error: 'File non trovato' });

    const base64 = asset.dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    res.set('Content-Type', asset.mimeType);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
