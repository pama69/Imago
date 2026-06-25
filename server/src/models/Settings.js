import mongoose from 'mongoose';

/**
 * Unico documento di impostazioni (singleton).
 * Le chiavi API vengono salvate qui (in prod andrebbero cifrate).
 */
const settingsSchema = new mongoose.Schema({
  _id:           { type: String, default: 'singleton' },
  geminiKey:     { type: String, default: '' },
  grokKey:       { type: String, default: '' },
  seedanceKey:   { type: String, default: '' },
  mongoUri:      { type: String, default: '' },
  updatedAt:     { type: Date, default: Date.now },
});

export const Settings = mongoose.model('Settings', settingsSchema);
