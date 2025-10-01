"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramLinkToken = void 0;
const mongoose_1 = require("mongoose");
const TelegramLinkTokenSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    creadoEn: { type: Date, required: true, index: true },
    expiraEn: { type: Date, required: true, index: true }
});
exports.TelegramLinkToken = (0, mongoose_1.model)('TelegramLinkToken', TelegramLinkTokenSchema, 'telegram_link_tokens');
