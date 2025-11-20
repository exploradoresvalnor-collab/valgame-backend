"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shop_controller_1 = require("../controllers/shop.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// GET /api/shop/info - Obtener información de la tienda
router.get('/info', shop_controller_1.getShopInfo);
// POST /api/shop/buy-evo - Comprar Cristales de Evolución con VAL
router.post('/buy-evo', auth_1.auth, shop_controller_1.buyEvo);
// POST /api/shop/buy-boletos - Comprar boletos con VAL
router.post('/buy-boletos', auth_1.auth, shop_controller_1.buyBoletos);
// POST /api/shop/buy-val - Comprar paquete de VAL (dinero real)
router.post('/buy-val', auth_1.auth, shop_controller_1.buyValPackage);
exports.default = router;
