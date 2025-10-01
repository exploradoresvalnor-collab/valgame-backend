import { Schema, model, Document } from 'mongoose';

export interface ITelegramLinkToken extends Document {
  userId: string;
  token: string;
  creadoEn: Date;
  expiraEn: Date;
}

const TelegramLinkTokenSchema = new Schema<ITelegramLinkToken>({
  userId: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true, index: true },
  creadoEn: { type: Date, required: true, index: true },
  expiraEn: { type: Date, required: true, index: true }
});

export const TelegramLinkToken = model<ITelegramLinkToken>('TelegramLinkToken', TelegramLinkTokenSchema, 'telegram_link_tokens');
