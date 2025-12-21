import { Router } from 'express';
import { buyEvo, buyValPackage, getShopInfo, buyBoletos } from '../controllers/shop.controller';
import { auth } from '../middlewares/auth';
import PackageModel from '../models/Package';

const router = Router();

// GET /api/shop/info - Obtener información de la tienda
router.get('/info', getShopInfo);

// GET /api/shop/packages - Alias listado paquetes VAL
router.get('/packages', async (req, res) => {
	try {
		const packages = await PackageModel.find({});
		return res.json(packages);
	} catch (error) {
		console.error('Error listando packages:', error);
		return res.status(500).json({ error: 'Error interno' });
	}
});

// POST /api/shop/buy-evo - Comprar Cristales de Evolución con VAL
router.post('/buy-evo', auth, buyEvo);

// POST /api/shop/buy-boletos - Comprar boletos con VAL
router.post('/buy-boletos', auth, buyBoletos);

// POST /api/shop/buy-val - Comprar paquete de VAL (dinero real)
router.post('/buy-val', auth, buyValPackage);

// POST /api/shop/purchase - compra genérica (alias multi propósito)
router.post('/purchase', auth, async (req, res) => {
	try {
		const { purchaseType } = req.body;
		switch (purchaseType) {
			case 'evo':
				return buyEvo(req as any, res);
			case 'boletos':
				return buyBoletos(req as any, res);
			case 'val':
				return buyValPackage(req as any, res);
			default:
				return res.status(400).json({ error: 'purchaseType inválido' });
		}
	} catch (error) {
		console.error('Error en purchase genérico:', error);
		return res.status(500).json({ error: 'Error interno' });
	}
});

export default router;
