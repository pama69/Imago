import { Router } from 'express';
import { Session } from '../models/Session.js';
import { Asset } from '../models/Asset.js';

export const sessionsRouter = Router();

// GET /api/sessions — lista tutte le sessioni (archivio)
sessionsRouter.get('/', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 }).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/:id — dettaglio sessione con assets
sessionsRouter.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).lean();
    if (!session) return res.status(404).json({ error: 'Sessione non trovata' });

    const assets = await Asset.find({ session: session._id }).sort({ createdAt: 1 }).lean();
    res.json({ ...session, assets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sessions/:id — elimina sessione e tutti i suoi assets
sessionsRouter.delete('/:id', async (req, res) => {
  try {
    await Asset.deleteMany({ session: req.params.id });
    await Session.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
