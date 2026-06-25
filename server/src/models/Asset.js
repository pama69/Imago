import mongoose from 'mongoose';

/**
 * Asset = singola immagine o video (sorgente o generato).
 * I file binari sono salvati su MongoDB GridFS;
 * qui teniamo i metadati e il riferimento.
 */
const assetSchema = new mongoose.Schema({
  session:    { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  role:       { type: String, enum: ['source', 'generated'], required: true },
  type:       { type: String, enum: ['image', 'video'], required: true },
  gridfsId:   { type: mongoose.Schema.Types.ObjectId }, // ID file in GridFS
  dataUrl:    { type: String },   // fallback base64 per demo senza GridFS
  mimeType:   { type: String },
  width:      { type: Number },
  height:     { type: Number },
  size:       { type: Number },   // bytes
  model:      { type: String },
  prompt:     { type: String },
  createdAt:  { type: Date, default: Date.now },
});

export const Asset = mongoose.model('Asset', assetSchema);
