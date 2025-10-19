import 'express-serve-static-core';
import { IUser } from '../../models/User';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    user?: IUser;
  }
}
