import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPackage extends Document {
  userId: string;
  paqueteId: string;
  fecha: Date;
  // Si el paquete no existe en la colección 'packages', guardamos un snapshot JSON aquí
  packageSnapshot?: any;
  // 🔒 Lock para prevenir race conditions al abrir paquetes
  locked?: boolean;
  lockedAt?: Date;
}

const UserPackageSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  paqueteId: { type: String, required: true, index: true },
  packageSnapshot: { type: Schema.Types.Mixed },
  fecha: { type: Date, default: Date.now },
  locked: { type: Boolean, default: false, select: false }, // 🔒 No se devuelve por defecto
  lockedAt: { type: Date }
}, { versionKey: false });

export default mongoose.model<IUserPackage>('UserPackage', UserPackageSchema, 'user_packages');
