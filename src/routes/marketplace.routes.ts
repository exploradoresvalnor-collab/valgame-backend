import { Router, Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import * as MarketplaceService from '../services/marketplace.service';
import { IUser } from '../models/User';
import { Document, Types } from 'mongoose';
import {
  CreateListingDTO,
  SearchFiltersDTO,
  BuyItemDTO,
  CancelListingDTO,
  MARKETPLACE_LIMITS,
  PRECIOS_MINIMOS
} from '../validations/marketplace.validations';

// Extendemos la interfaz IUser para incluir el tipo Document de Mongoose
type IUserWithDocument = IUser & Document & {
  _id: Types.ObjectId;
};

const router = Router();

// Crear un nuevo listing
router.post('/listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ✅ Validar con DTO
    const validatedData = CreateListingDTO.parse(req.body);
    
    if (!req.user) throw new ValidationError('Usuario no autenticado');
    
    const listing = await MarketplaceService.listItem(
      req.user as IUserWithDocument,
      validatedData.itemId,
      validatedData.precio,
      validatedData.destacar
      // ⚠️ NO se envía metadata desde el cliente (se genera en backend)
    );
    
    // Normalizar respuesta para que los tests esperen { listing: { id: ... } }
    if (listing) {
      const resp = { listing: { id: listing._id ? listing._id.toString() : (listing.id || undefined), ...listing } };
      res.status(201).json(resp);
    } else {
      res.status(201).json({ listing: null });
    }
  } catch (error) {
    next(error);
  }
});

// Obtener listings con filtros
router.get('/listings', async (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
  try {
    // ✅ Validar filtros con DTO
    const filters = SearchFiltersDTO.parse(req.query);
    const results = await MarketplaceService.getListings(filters);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Comprar un item
router.post('/listings/:id/buy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ValidationError('Usuario no autenticado');
    
    // ✅ Validar ID con DTO
    const { listingId } = BuyItemDTO.parse({ listingId: req.params.id });
    
    const result = await MarketplaceService.buyItem(req.user, listingId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Cancelar un listing (también soportamos DELETE para los tests que usan ese método)
router.delete('/listings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ValidationError('Usuario no autenticado');
    
    // ✅ Validar ID con DTO
    const { listingId } = CancelListingDTO.parse({ listingId: req.params.id });
    
    const result = await MarketplaceService.cancelListing(req.user, listingId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;