import { Request, Response } from 'express';
import User from '../models/User';
import Listing from '../models/Listing';
import Item from '../models/Item';
import { Types } from 'mongoose';

export const listItemInMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
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
    const itemIndex = user.inventarioEquipamiento.findIndex(id => id.toString() === itemIdObj.toString());
    if (itemIndex === -1) {
      res.status(403).json({ error: 'Item not in user inventory' });
      return;
    }

    // Create listing
    const listing = new Listing({
      itemId: itemIdObj,
      sellerId: new Types.ObjectId(userId),
      precio,
      descripcion: descripcion || '',
      estado: 'activo',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await listing.save();

    res.status(201).json({
      exito: true,
      listing: {
        id: listing._id,
        itemId: listing.itemId,
        sellerId: listing.sellerId,
        precio: listing.precio,
        estado: listing.estado
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const buyItemFromMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { listingId } = req.params;

    // Validate listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    if (listing.estado !== 'activo') {
      res.status(400).json({ error: 'Listing is not active' });
      return;
    }

    // Get buyer
    const buyer = await User.findById(userId);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer not found' });
      return;
    }

    // Get seller
    const seller = await User.findById(listing.sellerId);
    if (!seller) {
      res.status(404).json({ error: 'Seller not found' });
      return;
    }

    // Check buyer has sufficient funds
    if (buyer.val < listing.precio) {
      res.status(400).json({ error: 'Insufficient funds' });
      return;
    }

    // Validate item exists
    const item = await Item.findById(listing.itemId);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // Calculate commission (5%)
    const comision = Math.floor(listing.precio * 0.05);
    const montoVendedor = listing.precio - comision;

    // Transfer money
    buyer.val -= listing.precio;
    seller.val += montoVendedor;

    // Transfer item
    const itemIdObj = new Types.ObjectId(listing.itemId.toString());
    const sellerItemIndex = seller.inventarioEquipamiento.findIndex(id => id.toString() === itemIdObj.toString());
    if (sellerItemIndex !== -1) {
      seller.inventarioEquipamiento.splice(sellerItemIndex, 1);
    }
    buyer.inventarioEquipamiento.push(itemIdObj);

    // Mark listing as sold
    listing.estado = 'vendido';

    await Promise.all([buyer.save(), seller.save(), listing.save()]);

    res.status(200).json({
      exito: true,
      transaccion: {
        listingId: listing._id,
        compradorId: userId,
        vendedorId: listing.sellerId,
        precioOriginal: listing.precio,
        comision,
        montoVendedor,
        itemId: listing.itemId
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelMarketplaceListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { listingId } = req.params;

    // Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Verify user is seller
    if (listing.sellerId.toString() !== userId) {
      res.status(403).json({ error: 'Only seller can cancel listing' });
      return;
    }

    if (listing.estado !== 'activo') {
      res.status(400).json({ error: 'Can only cancel active listings' });
      return;
    }

    // Get seller
    const seller = await User.findById(userId);
    if (!seller) {
      res.status(404).json({ error: 'Seller not found' });
      return;
    }

    // Return item to inventory
    const itemIdObj = new Types.ObjectId(listing.itemId.toString());
    seller.inventarioEquipamiento.push(itemIdObj);

    // Mark listing as cancelled
    listing.estado = 'cancelado';

    await Promise.all([seller.save(), listing.save()]);

    res.status(200).json({
      exito: true,
      listing: {
        id: listing._id,
        estado: 'cancelado',
        itemId: listing.itemId
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
