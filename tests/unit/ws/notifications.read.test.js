"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
// Mock auth middleware to inject userId
jest.mock('../../../src/middlewares/auth', () => ({
    auth: (req, _res, next) => { req.userId = '507f1f77bcf86cd799439011'; next(); }
}));
// Mock Notification model
const findOneAndUpdate = jest.fn().mockResolvedValue({ _id: '64f1f77bcf86cd7994390123', isRead: true });
jest.mock('../../../src/models/Notification', () => ({
    Notification: { findOneAndUpdate }
}));
// Spy RealtimeService
const notifyNotificationRead = jest.fn();
jest.mock('../../../src/services/realtime.service', () => ({
    RealtimeService: class {
        constructor() {
            this.notifyNotificationRead = notifyNotificationRead;
        }
        static getInstance() { return new this(); }
    }
}));
// Router under test
const notifications_routes_1 = __importDefault(require("../../../src/routes/notifications.routes"));
describe('notification:read events', () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/notifications', notifications_routes_1.default);
    beforeEach(() => {
        notifyNotificationRead.mockClear();
        findOneAndUpdate.mockClear();
    });
    it('emite notification:read al marcar una notificación como leída', async () => {
        const id = '507f1f77bcf86cd799439011';
        const res = await (0, supertest_1.default)(app)
            .put(`/api/notifications/${id}/read`)
            .send({});
        expect(res.status).toBe(200);
        expect(findOneAndUpdate).toHaveBeenCalled();
        expect(notifyNotificationRead).toHaveBeenCalledWith('507f1f77bcf86cd799439011', id);
    });
});
