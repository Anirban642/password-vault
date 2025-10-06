import mongoose, { Schema, Document } from 'mongoose';

export interface IVaultItem extends Document {
  userId: string;
  encryptedData: string;
  createdAt: Date;
}

const VaultItemSchema: Schema = new Schema({
  userId: { type: String, required: true },
  encryptedData: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);