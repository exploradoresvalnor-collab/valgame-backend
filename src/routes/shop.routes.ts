import { Router } from 'express';
import { buyEvo, buyValPackage, getShopInfo } from '../controllers/shop.controller';
import { auth } from '../middlewares/auth';

const router = Router();

// GET /api/shop/info - Obtener información de la tienda
router.get('/info', getShopInfo);

// POST /api/shop/buy-evo - Comprar Cristales de Evolución con VAL
router.post('/buy-evo', auth, buyEvo);

// POST /api/shop/buy-val - Comprar paquete de VAL (dinero real)
router.post('/buy-val', auth, buyValPackage);

export default router;
