"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shop_controller_1 = require("../controllers/shop.controller");
const auth_1 = require("../middlewares/auth");
const Package_1 = __importDefault(require("../models/Package"));
const router = (0, express_1.Router)();
// GET /api/shop/info - Obtener información de la tienda
router.get('/info', shop_controller_1.getShopInfo);
// GET /api/shop/packages - Alias listado paquetes VAL
router.get('/packages', async (req, res) => {
    try {
        const packages = await Package_1.default.find({});
        return res.json(packages);
    }
    catch (error) {
        console.error('Error listando packages:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/shop/buy-evo - Comprar Cristales de Evolución con VAL
router.post('/buy-evo', auth_1.auth, shop_controller_1.buyEvo);
// POST /api/shop/buy-boletos - Comprar boletos con VAL
router.post('/buy-boletos', auth_1.auth, shop_controller_1.buyBoletos);
// POST /api/shop/buy-val - Comprar paquete de VAL (dinero real)
router.post('/buy-val', auth_1.auth, shop_controller_1.buyValPackage);
// POST /api/shop/purchase - compra genérica (alias multi propósito)
router.post('/purchase', auth_1.auth, async (req, res) => {
    try {
        const { purchaseType } = req.body;
        switch (purchaseType) {
            case 'evo':
                return (0, shop_controller_1.buyEvo)(req, res);
            case 'boletos':
                return (0, shop_controller_1.buyBoletos)(req, res);
            case 'val':
                return (0, shop_controller_1.buyValPackage)(req, res);
            default:
                return res.status(400).json({ error: 'purchaseType inválido' });
        }
    }
    catch (error) {
        console.error('Error en purchase genérico:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
});
exports.default = router;
