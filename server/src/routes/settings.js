import { Router } from 'express';
import { Settings } from '../models/Settings.js';

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get('/', async (_req, res) => {
  try {
    let s = await Settings.findById('singleton');
    if (!s) s = await Settings.create({ _id: 'singleton' });
    // Non esporre le chiavi in chiaro — mascherale
    const masked = {
      geminiKey:   s.geminiKey  ? '••••' + s.geminiKey.slice(-4)  : '',
      grokKey:     s.grokKey    ? '••••' + s.grokKey.slice(-4)    : '',
      seedanceKey: s.seedanceKey? '••••' + s.seedanceKey.slice(-4): '',
      hasGemini:   !!s.geminiKey,
      hasGrok:     !!s.grokKey,
      hasSeedance: !!s.seedanceKey,
    };
    res.json(masked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings
settingsRouter.put('/', async (req, res) => {
  try {
    const { geminiKey, grokKey, seedanceKey } = req.body;
    const update = { updatedAt: new Date() };
    if (geminiKey  !== undefined) update.geminiKey   = geminiKey;
    if (grokKey    !== undefined) update.grokKey     = grokKey;
    if (seedanceKey!== undefined) update.seedanceKey = seedanceKey;

    const s = await Settings.findByIdAndUpdate(
      'singleton',
      { $set: update },
      { new: true, upsert: true }
    );

    // Aggiorna anche le variabili d'ambiente in memoria per questa sessione
    if (s.geminiKey)   process.env.GEMINI_API_KEY   = s.geminiKey;
    if (s.grokKey)     process.env.GROK_API_KEY     = s.grokKey;
    if (s.seedanceKey) process.env.SEEDANCE_API_KEY = s.seedanceKey;

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
