import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  _id:            { type: String, default: 'singleton' },
  klifgenUsername: { type: String, default: '' },
  klifgenKey:      { type: String, default: '' },
  updatedAt:       { type: Date, default: Date.now },
});

export const Settings = mongoose.model('Settings', settingsSchema);
