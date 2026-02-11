"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelMarketplaceListing = exports.buyItemFromMarketplace = exports.listItemInMarketplace = void 0;
const User_1 = require("../models/User");
const mongoose_1 = require("mongoose");
const marketplaceService = __importStar(require("../services/marketplace.service"));
const listItemInMarketplace = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id?.toString();
        const { itemId, precio, descripcion } = req.body;
        if (!itemId || !precio || precio <= 0) {
            res.status(400).json({ error: 'Invalid item or price' });
            return;
        }
        // Validate user exists
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Check if user owns the item
        const itemIdObj = new mongoose_1.Types.ObjectId(itemId);
        const itemIndex = user.inventarioEquipamiento.findIndex((id) => id.toString() === itemIdObj.toString());
        if (itemIndex === -1) {
            res.status(403).json({ error: 'Item not in user inventory' });
            return;
        }
        // Delegate to marketplace service which handles atomic listing, inventory updates and transaction audit
        const sellerDoc = await User_1.User.findById(userId);
        if (!sellerDoc) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const createdListing = await marketplaceService.listItem(sellerDoc, itemId, precio, false);
        res.status(201).json({
            exito: true,
            listing: {
                id: createdListing._id,
                itemId: createdListing.itemId,
                sellerId: createdListing.sellerId,
                precio: createdListing.precio,
                estado: createdListing.estado
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listItemInMarketplace = listItemInMarketplace;
const buyItemFromMarketplace = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id?.toString();
        const { listingId } = req.params;
        const buyer = await User_1.User.findById(userId);
        if (!buyer) {
            res.status(404).json({ error: 'Buyer not found' });
            return;
        }
        // Delegate to marketplace service which performs atomic buy and auditing
        const result = await marketplaceService.buyItem(buyer, listingId);
        // Mantener compatibilidad con API antigua (propiedades en español)
        res.status(200).json({ exito: true, transaccion: result.transaction || result });
    }
    catch (error) {
        console.error('Error in buyItemFromMarketplace:', error);
        res.status(500).json({ error: error.message });
        return;
    }
};
exports.buyItemFromMarketplace = buyItemFromMarketplace;
const cancelMarketplaceListing = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id?.toString();
        const { listingId } = req.params;
        const seller = await User_1.User.findById(userId);
        if (!seller) {
            res.status(404).json({ error: 'Seller not found' });
            return;
        }
        const result = await marketplaceService.cancelListing(seller, listingId);
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        console.error('Error in cancelMarketplaceListing:', error);
        res.status(500).json({ error: error.message });
        return;
    }
};
exports.cancelMarketplaceListing = cancelMarketplaceListing;
