import { Router } from 'express';
import { Settings } from '../models/Settings.js';

export const settingsRouter = Router();

settingsRouter.get('/', async (_req, res) => {
  try {
    let s = await Settings.findById('singleton');
    if (!s) s = await Settings.create({ _id: 'singleton' });
    res.json({
      klifgenUsername: s.klifgenUsername || '',
      hasKey: !!s.klifgenKey,
      keyPreview: s.klifgenKey ? '••••' + s.klifgenKey.slice(-4) : '',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

settingsRouter.put('/', async (req, res) => {
  try {
    const { klifgenUsername, klifgenKey } = req.body;
    const update = { updatedAt: new Date() };
    if (klifgenUsername !== undefined) update.klifgenUsername = klifgenUsername;
    if (klifgenKey      !== undefined) update.klifgenKey      = klifgenKey;

    const s = await Settings.findByIdAndUpdate('singleton', { $set: update }, { new: true, upsert: true });

    // Aggiorna env in memoria
    if (s.klifgenUsername) process.env.KLIFGEN_USERNAME   = s.klifgenUsername;
    if (s.klifgenKey)      process.env.KLIFGEN_SECRET_KEY = s.klifgenKey;

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
