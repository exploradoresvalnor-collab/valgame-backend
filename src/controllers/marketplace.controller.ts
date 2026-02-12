import { Request, Response } from 'express';
import { User } from '../models/User';
import Listing from '../models/Listing';
import { Item } from '../models/Item';
import { Types } from 'mongoose';
import * as marketplaceService from '../services/marketplace.service';

export const listItemInMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id?.toString();
    const { itemId, precio, descripcion } = req.body;

    if (!itemId || !precio || precio <= 0) {
      res.status(400).json({ error: 'Invalid item or price' });
      return;
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user owns the item
    const itemIdObj = new Types.ObjectId(itemId);
    
    const isEquipment = user.inventarioEquipamiento && user.inventarioEquipamiento.some((id: any) => id.toString() === itemIdObj.toString());
    
    // Check consumables (format: [{consumableId: ObjectId, usos_restantes: Number}])
    const isConsumable = user.inventarioConsumibles && user.inventarioConsumibles.some(
      (c: any) => c.consumableId?.toString() === itemIdObj.toString() && c.usos_restantes > 0
    );

    if (!isEquipment && !isConsumable) {
      res.status(403).json({ error: 'Item not in user inventory' });
      return;
    }

    // Delegate to marketplace service which handles atomic listing, inventory updates and transaction audit
    const sellerDoc = await User.findById(userId);
    if (!sellerDoc) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const createdListing = await marketplaceService.listItem(sellerDoc as any, itemId, precio, false);

    res.status(201).json({
      exito: true,
      listing: {
        id: (createdListing as any)._id,
        itemId: (createdListing as any).itemId,
        sellerId: (createdListing as any).sellerId,
        precio: (createdListing as any).precio,
        estado: (createdListing as any).estado
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const buyItemFromMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id?.toString();
    const { listingId } = req.params;

    const buyer = await User.findById(userId);
    if (!buyer) { res.status(404).json({ error: 'Buyer not found' }); return; }

    // Delegate to marketplace service which performs atomic buy and auditing
    const result = await marketplaceService.buyItem(buyer as any, listingId);

    // Mantener compatibilidad con API antigua (propiedades en español)
    res.status(200).json({ exito: true, transaccion: result.transaction || result });
  } catch (error: any) {
    console.error('Error in buyItemFromMarketplace:', error);
    res.status(500).json({ error: error.message });
    return;
  }
};

export const cancelMarketplaceListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id?.toString();
    const { listingId } = req.params;

    const seller = await User.findById(userId);
    if (!seller) { res.status(404).json({ error: 'Seller not found' }); return; }

    const result = await marketplaceService.cancelListing(seller as any, listingId);

    res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error('Error in cancelMarketplaceListing:', error);
    res.status(500).json({ error: error.message });
    return;
  }
};
