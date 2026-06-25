import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { sessionsRouter } from './routes/sessions.js';
import { assetsRouter } from './routes/assets.js';
import { generateRouter } from './routes/generate.js';
import { settingsRouter } from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── MongoDB ─────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.warn('⚠️  MONGODB_URI non configurata — avvio in modalità demo');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Atlas connesso'))
    .catch(err => console.error('❌ MongoDB errore:', err.message));
}

// ── Routes ──────────────────────────────────────────────────
app.use('/api/sessions', sessionsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/generate', generateRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ── Serve React build in produzione ─────────────────────────
const publicDir = join(__dirname, '..', 'public');
if (existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => res.sendFile(join(publicDir, 'index.html')));
}

// ── Start ───────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`🚀 Imago server → http://localhost: