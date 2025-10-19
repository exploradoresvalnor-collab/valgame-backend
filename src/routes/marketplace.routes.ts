import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auth } from '../middlewares/auth';
import { ValidationError } from '../utils/errors';
import * as MarketplaceService from '../services/marketplace.service';
import { IUser } from '../models/User';
import { Document, Types } from 'mongoose';

// Extendemos la interfaz IUser para incluir el tipo Document de Mongoose
type IUserWithDocument = IUser & Document & {
  _id: Types.ObjectId;
};

const router = Router();

// Define el tipo para una request autenticada
interface IAuthenticatedRequest extends Request {
  user?: IUserWithDocument;
}

// Esquema de validación para crear un listing
const createListingSchema = z.object({
  itemId: z.string(),
  precio: z.number().min(1),
  destacar: z.boolean().optional(),
  metadata: z.object({
    nivel: z.number().optional(),
    rango: z.string().optional(),
    durabilidad: z.number().optional(),
    usos: z.number().optional(),
    stats: z.object({
      atk: z.number().optional(),
      defensa: z.number().optional(),
      vida: z.number().optional()
    }).optional()
  }).optional()
});

// Esquema de validación para filtros de búsqueda
const searchFiltersSchema = z.object({
  type: z.string().optional(),
  precioMin: z.number().optional(),
  precioMax: z.number().optional(),
  destacados: z.boolean().optional(),
  rango: z.string().optional(),
  nivelMin: z.number().optional(),
  nivelMax: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional()
});

// Crear un nuevo listing
router.post('/listings', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createListingSchema.parse(req.body);
    if (!req.user) throw new ValidationError('Usuario no autenticado');
    const listing = await MarketplaceService.listItem(
      req.user as IUserWithDocument,
      validatedData.itemId,
      validatedData.precio,
      validatedData.destacar,
      validatedData.metadata
    );
    res.status(201).json(listing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError({ message: error.issues[0].message }));
    } else {
      next(error);
    }
  }
});

// Obtener listings con filtros
router.get('/listings', async (req: Request<any, any, any, z.infer<typeof searchFiltersSchema>>, res: Response, next: NextFunction) => {
  try {
    const filters = searchFiltersSchema.parse(req.query);
    const results = await MarketplaceService.getListings(filters);
    res.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError({ message: error.issues[0].message }));
    } else {
      next(error);
    }
  }
});

// Comprar un item
router.post('/listings/:id/buy', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ValidationError('Usuario no autenticado');
    const result = await MarketplaceService.buyItem(req.user, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Cancelar un listing
router.post('/listings/:id/cancel', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ValidationError('Usuario no autenticado');
    const result = await MarketplaceService.cancelListing(req.user, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;