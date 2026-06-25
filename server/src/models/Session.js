import mongoose from 'mongoose';

/**
 * Session = una "cartella" di generazione.
 * Ogni volta che l'utente preme "Genera", si crea una Session.
 * Tutte le immagini/video prodotti in quella sessione vi appartengono.
 */
const sessionSchema = new mongoose.Schema({
  prompt:      { type: String, required: true },
  model:       { type: String, required: true, enum: ['gemini', 'grok', 'seedance'] },
  type:        { type: String, required: true, enum: ['image', 'video'] },
  sourceAsset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }, // img sorgente (opzionale)
  assetCount:  { type: Number, default: 0 },
  thumbnail:   { type: String }, // URL/GridFS id della prima immagine generata
  createdAt:   { type: Date, default: Date.now },
});

export const Session = mongoose.model('Session', sessionSchema);
