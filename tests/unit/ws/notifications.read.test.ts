import express from 'express';
import request from 'supertest';

// Mock auth middleware to inject userId
jest.mock('../../../src/middlewares/auth', () => ({
  auth: (req: any, _res: any, next: any) => { req.userId = '507f1f77bcf86cd799439011'; next(); }
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
    static getInstance(){ return new (this as any)(); }
    notifyNotificationRead = notifyNotificationRead;
  }
}));

// Router under test
import notificationsRoutes from '../../../src/routes/notifications.routes';

describe('notification:read events', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/notifications', notificationsRoutes);

  beforeEach(() => {
    notifyNotificationRead.mockClear();
    findOneAndUpdate.mockClear();
  });

  it('emite notification:read al marcar una notificación como leída', async () => {
    const id = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .put(`/api/notifications/${id}/read`)
      .send({});
    expect(res.status).toBe(200);
    expect(findOneAndUpdate).toHaveBeenCalled();
    expect(notifyNotificationRead).toHaveBeenCalledWith('507f1f77bcf86cd799439011', id);
  });
});
