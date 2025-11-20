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
const express_1 = require("express");
const errors_1 = require("../utils/errors");
const MarketplaceService = __importStar(require("../services/marketplace.service"));
const marketplace_validations_1 = require("../validations/marketplace.validations");
const router = (0, express_1.Router)();
// Crear un nuevo listing
router.post('/listings', async (req, res, next) => {
    try {
        // ✅ Validar con DTO
        const validatedData = marketplace_validations_1.CreateListingDTO.parse(req.body);
        if (!req.user)
            throw new errors_1.ValidationError('Usuario no autenticado');
        const listing = await MarketplaceService.listItem(req.user, validatedData.itemId, validatedData.precio, validatedData.destacar
        // ⚠️ NO se envía metadata desde el cliente (se genera en backend)
        );
        // Normalizar respuesta para que los tests esperen { listing: { id: ... } }
        if (listing) {
            const resp = { listing: { id: listing._id ? listing._id.toString() : (listing.id || undefined), ...listing } };
            res.status(201).json(resp);
        }
        else {
            res.status(201).json({ listing: null });
        }
    }
    catch (error) {
        next(error);
    }
});
// Obtener listings con filtros
router.get('/listings', async (req, res, next) => {
    try {
        // ✅ Validar filtros con DTO
        const filters = marketplace_validations_1.SearchFiltersDTO.parse(req.query);
        const results = await MarketplaceService.getListings(filters);
        res.json(results);
    }
    catch (error) {
        next(error);
    }
});
// Comprar un item
router.post('/listings/:id/buy', async (req, res, next) => {
    try {
        if (!req.user)
            throw new errors_1.ValidationError('Usuario no autenticado');
        // ✅ Validar ID con DTO
        const { listingId } = marketplace_validations_1.BuyItemDTO.parse({ listingId: req.params.id });
        const result = await MarketplaceService.buyItem(req.user, listingId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Cancelar un listing (también soportamos DELETE para los tests que usan ese método)
router.delete('/listings/:id', async (req, res, next) => {
    try {
        if (!req.user)
            throw new errors_1.ValidationError('Usuario no autenticado');
        // ✅ Validar ID con DTO
        const { listingId } = marketplace_validations_1.CancelListingDTO.parse({ listingId: req.params.id });
        const result = await MarketplaceService.cancelListing(req.user, listingId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
