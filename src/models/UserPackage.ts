import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPackage extends Document {
  userId: string;
  paqueteId: string;
  fecha: Date;
}

const UserPackageSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  paqueteId: { type: String, required: true, index: true },
  fecha: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model<IUserPackage>('UserPackage', UserPackageSchema, 'user_packages');
