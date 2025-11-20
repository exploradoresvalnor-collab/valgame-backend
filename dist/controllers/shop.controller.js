"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyBoletos = exports.getShopInfo = exports.buyValPackage = exports.buyEvo = void 0;
const User_1 = require("../models/User");
const GameSetting_1 = __importDefault(require("../models/GameSetting"));
const realtime_service_1 = require("../services/realtime.service");
/**
 * Comprar Cristales de Evolución (EVO) con VAL
 * POST /api/shop/buy-evo
 * Body: { amount: number }
 */
const buyEvo = async (req, res) => {
    const { amount } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0.' });
    }
    try {
        // Cargar usuario y configuración del juego
        const [user, gameSettings] = await Promise.all([
            User_1.User.findById(userId),
            GameSetting_1.default.findOne()
        ]);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        // Obtener tasa de cambio de la configuración (por defecto 100 VAL = 1 EVO)
        const exchangeRate = gameSettings?.costo_evo_por_val || 100;
        // Calcular costo total
        const totalCost = amount * exchangeRate;
        // Validar que el usuario tiene suficiente VAL
        if (user.val < totalCost) {
            return res.status(400).json({
                error: `No tienes suficiente VAL para comprar ${amount} EVO.`,
                required: totalCost,
                current: user.val,
                missing: totalCost - user.val
            });
        }
        // Realizar la transacción
        user.val -= totalCost;
        user.evo = (user.evo || 0) + amount;
        await user.save();
        // Emitir evento WebSocket para actualizar recursos en tiempo real
        try {
            const realtimeService = realtime_service_1.RealtimeService.getInstance();
            // Usar el método de notificación de recursos si existe
            if (typeof realtimeService.notifyResourceUpdate === 'function') {
                realtimeService.notifyResourceUpdate(userId, {
                    val: user.val,
                    evo: user.evo,
                    type: 'BUY_EVO'
                });
            }
        }
        catch (err) {
            if (process.env.NODE_ENV !== 'test') {
                console.warn('[buyEvo] RealtimeService no disponible:', err);
            }
        }
        // Respuesta
        res.json({
            message: `Has comprado ${amount} Cristal${amount > 1 ? 'es' : ''} de Evolución por ${totalCost} VAL.`,
            transaction: {
                amount,
                cost: totalCost,
                exchangeRate
            },
            resources: {
                val: user.val,
                evo: user.evo
            }
        });
    }
    catch (error) {
        console.error('Error al comprar EVO:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.buyEvo = buyEvo;
/**
 * Comprar paquete de VAL (con dinero real o en-game currency)
 * POST /api/shop/buy-val
 * Body: { packageId: string }
 */
const buyValPackage = async (req, res) => {
    const { packageId } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    if (!packageId) {
        return res.status(400).json({ error: 'Debes especificar el ID del paquete.' });
    }
    try {
        // TODO: Implementar lógica de compra de paquetes de VAL
        // Esto requiere integración con sistema de pagos (Stripe, PayPal, etc.)
        res.status(501).json({
            error: 'Funcionalidad no implementada aún.',
            message: 'La compra de VAL con dinero real estará disponible próximamente.'
        });
    }
    catch (error) {
        console.error('Error al comprar paquete de VAL:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.buyValPackage = buyValPackage;
/**
 * Obtener información de la tienda (tasas de cambio, paquetes disponibles)
 * GET /api/shop/info
 */
const getShopInfo = async (_req, res) => {
    try {
        const gameSettings = await GameSetting_1.default.findOne();
        const exchangeRate = gameSettings?.costo_evo_por_val || 100;
        res.json({
            exchangeRates: {
                evoPerVal: exchangeRate,
                valPerEvo: 1 / exchangeRate,
                boletosPerVal: 100, // 100 VAL = 1 boleto
                valPerBoleto: 0.01
            },
            packages: [
                // TODO: Obtener paquetes de la base de datos
                {
                    id: 'val_small',
                    name: 'Paquete Pequeño de VAL',
                    amount: 500,
                    price: 4.99,
                    currency: 'USD'
                },
                {
                    id: 'val_medium',
                    name: 'Paquete Mediano de VAL',
                    amount: 1200,
                    price: 9.99,
                    currency: 'USD'
                },
                {
                    id: 'val_large',
                    name: 'Paquete Grande de VAL',
                    amount: 3000,
                    price: 19.99,
                    currency: 'USD'
                }
            ],
            note: 'La compra con dinero real estará disponible próximamente.'
        });
    }
    catch (error) {
        console.error('Error al obtener información de la tienda:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.getShopInfo = getShopInfo;
/**
 * Comprar boletos con VAL
 * POST /api/shop/buy-boletos
 * Body: { amount: number }
 */
const buyBoletos = async (req, res) => {
    const { amount } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0.' });
    }
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        // Costo: 100 VAL = 1 boleto
        const COST_PER_BOLETO = 100;
        const totalCost = amount * COST_PER_BOLETO;
        // Validar que tiene suficiente VAL
        if (user.val < totalCost) {
            return res.status(400).json({
                error: `No tienes suficiente VAL para comprar ${amount} boleto${amount > 1 ? 's' : ''}.`,
                required: totalCost,
                current: user.val,
                missing: totalCost - user.val
            });
        }
        // Validar límite máximo de boletos
        const maxBoletos = 10;
        const boletosActuales = user.boletos || 0;
        if (boletosActuales + amount > maxBoletos) {
            return res.status(400).json({
                error: `No puedes tener más de ${maxBoletos} boletos. Actualmente tienes ${boletosActuales}.`,
                maximo: maxBoletos,
                actual: boletosActuales,
                solicitado: amount
            });
        }
        // Realizar la transacción
        user.val -= totalCost;
        user.boletos = boletosActuales + amount;
        await user.save();
        // Notificar en tiempo real
        try {
            const realtimeService = realtime_service_1.RealtimeService.getInstance();
            if (typeof realtimeService.notifyResourceUpdate === 'function') {
                realtimeService.notifyResourceUpdate(userId, {
                    val: user.val,
                    boletos: user.boletos,
                    type: 'BUY_BOLETOS'
                });
            }
        }
        catch (err) {
            if (process.env.NODE_ENV !== 'test') {
                console.warn('[buyBoletos] RealtimeService no disponible:', err);
            }
        }
        res.json({
            message: `Has comprado ${amount} boleto${amount > 1 ? 's' : ''} por ${totalCost} VAL.`,
            transaction: {
                amount,
                cost: totalCost,
                costPerBoleto: COST_PER_BOLETO
            },
            resources: {
                val: user.val,
                boletos: user.boletos
            }
        });
    }
    catch (error) {
        console.error('Error al comprar boletos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
exports.buyBoletos = buyBoletos;
