import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { validateBody } from '../middlewares/validate';
import { AddCharacterSchema } from '../validations/character.schemas';
import BaseCharacter from '../models/BaseCharacter'; // Importamos el modelo de personajes base para validación
import { Item } from '../models/Item';
import UserPackage from '../models/UserPackage'; // Importación correcta
import PackageModel from '../models/Package'; // Importación correcta

const router = Router();

// --- Rutas que ya tenías ---

// Lista usuarios (solo para probar)
router.get('/', auth, async (_req: Request, res: Response) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
});

// Datos del usuario autenticado
router.get('/me', auth, async (req: Request, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });

  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  // ✅ Devolver datos completos con fallback a 0 para recursos
  res.json({
    id: user._id,
    email: user.email,
    username: user.username,
    isVerified: user.isVerified,
    tutorialCompleted: user.tutorialCompleted,
    val: user.val ?? 0,
    boletos: user.boletos ?? 0,
    evo: user.evo ?? 0,
    invocaciones: user.invocaciones ?? 0,
    evoluciones: user.evoluciones ?? 0,
    boletosDiarios: user.boletosDiarios ?? 0,
    personajes: await Promise.all(
      (user.personajes || []).map(async (p) => {
        const base = await BaseCharacter.findOne({ id: p.personajeId });
        return {
          personajeId: p.personajeId,
          nombre: base?.nombre || p.personajeId,
          imagen: base?.imagen || null,
          rango: p.rango,
          nivel: p.nivel,
          etapa: p.etapa,
          progreso: p.progreso,
          experiencia: p.experiencia,
          saludActual: p.saludActual,
          saludMaxima: p.saludMaxima,
          estado: p.estado,
          equipamiento: await Promise.all(
            (p.equipamiento || []).map(async (eid) => {
              const eq = await Item.findById(eid);
              return eq ? {
                id: eq._id,
                nombre: eq.nombre,
                tipoItem: eq.tipoItem,
                imagen: eq.imagen,
                ...(eq.tipoItem ? { slot: eq.tipoItem } : {}),
              } : { id: eid };
            })
          ),
          activeBuffs: p.activeBuffs,
        };
      })
    ),
    inventarioEquipamiento: await Promise.all(
      (user.inventarioEquipamiento || []).map(async (id) => {
        const item = await Item.findById(id);
        return item ? {
          id: item._id,
          nombre: item.nombre,
          tipoItem: item.tipoItem,
          ...(item.tipoItem ? { slot: item.tipoItem } : {}),
        } : { id };
      })
    ),
    inventarioConsumibles: await Promise.all(
      (user.inventarioConsumibles || []).map(async (consumible) => {
        const item = await Item.findById(consumible.consumableId);
        return item ? {
          id: item._id,
          nombre: item.nombre,
          tipoItem: item.tipoItem,
          usos_restantes: consumible.usos_restantes,
        } : { id: consumible.consumableId, usos_restantes: consumible.usos_restantes };
      })
    ),
    // --- NUEVO: paquetes del usuario expandidos ---
    paquetes: await Promise.all(
      (await UserPackage.find({ userId: user._id })).map(async (userPackage) => {
        const paquete = await PackageModel.findById(userPackage.paqueteId);
        if (paquete) {
          return {
            id: paquete._id,
            nombre: paquete.nombre,
            tipo: paquete.tipo,
            precio_usdt: paquete.precio_usdt,
            precio_val: paquete.precio_val,
            personajes: paquete.personajes,
            categorias_garantizadas: paquete.categorias_garantizadas,
            distribucion_aleatoria: paquete.distribucion_aleatoria,
            val_reward: paquete.val_reward,
            items_reward: paquete.items_reward,
            fecha: userPackage.fecha
          };
        } else if (userPackage.packageSnapshot) {
          // Si el paquete fue borrado, usar snapshot
          return { ...userPackage.packageSnapshot, fecha: userPackage.fecha };
        } else {
          return { id: userPackage.paqueteId, fecha: userPackage.fecha };
        }
      })
    ),
    limiteInventarioEquipamiento: user.limiteInventarioEquipamiento,
    limiteInventarioConsumibles: user.limiteInventarioConsumibles,
    limiteInventarioPersonajes: user.limiteInventarioPersonajes,
    personajeActivoId: user.personajeActivoId,
    receivedPioneerPackage: user.receivedPioneerPackage,
    walletAddress: user.walletAddress,
    fechaRegistro: user.fechaRegistro,
    ultimaActualizacion: user.ultimaActualizacion
  });
});


// GET /api/users/resources - Obtener solo los recursos del usuario (más ligero que /me)
router.get('/resources', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await User.findById(req.userId).select('val boletos evo');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json({
      val: user.val,
      boletos: user.boletos,
      evo: user.evo
    });
  } catch (error) {
    console.error('Error al obtener recursos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// GET /api/users/dashboard - Obtener datos consolidados para el dashboard
router.get('/dashboard', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await User.findById(req.userId).select('val boletos evo dungeon_stats personajes');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Contar notificaciones no leídas
    const unreadNotifications = await Notification.countDocuments({
      userId: req.userId,
      isRead: false
    });

    // Contar personajes heridos
    const injuredCharacters = user.personajes.filter(p => p.estado === 'herido').length;

    return res.json({
      resources: {
        val: user.val,
        boletos: user.boletos,
        evo: user.evo
      },
      dungeonStats: user.dungeon_stats,
      notifications: {
        unreadCount: unreadNotifications
      },
      characters: {
        total: user.personajes.length,
        injured: injuredCharacters
      }
    });
  } catch (error) {
    console.error('Error al obtener datos de dashboard:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// PUT /api/users/tutorial/complete - Marcar el tutorial como completado
router.put('/tutorial/complete', auth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { tutorialCompleted: true },
      { new: true }
    ).select('tutorialCompleted');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json({
      message: 'Tutorial completado',
      tutorialCompleted: user.tutorialCompleted
    });
  } catch (error) {
    console.error('Error al completar tutorial:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// --- 👇 RUTA NUEVA PARA AÑADIR PERSONAJES 👇 ---

// POST /users/characters/add
router.post('/characters/add', auth, validateBody(AddCharacterSchema), async (req: Request, res: Response) => {
  const { personajeId, rango } = req.body;
  const userId = req.userId;

  try {
    // 2. Verificar que el personaje base exista en el catálogo del juego
    const baseCharacter = await BaseCharacter.findOne({ id: personajeId });
    if (!baseCharacter) {
      return res.status(400).json({ error: `El personaje con id '${personajeId}' no existe.` });
    }

    // 3. Buscar al usuario que hace la petición
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // 4. Verificar que el usuario no tenga ya ese personaje para evitar duplicados
    const yaLoTiene = user.personajes.some(p => p.personajeId === personajeId);
    if (yaLoTiene) {
      return res.status(409).json({ error: `El usuario ya posee el personaje '${personajeId}'.` });
    }

    // 5. Crear el objeto del nuevo personaje con su estructura completa
    const nuevoPersonaje = {
        personajeId: baseCharacter.id,
        rango,
        nivel: 1,
        etapa: 1,
        progreso: 0,
        stats: baseCharacter.stats, // Copiamos las stats base del catálogo
        saludActual: baseCharacter.stats.vida, // El personaje empieza con la salud al máximo
        saludMaxima: baseCharacter.stats.vida,
        estado: 'saludable',
        fechaHerido: null,
    };

    user.personajes.push(nuevoPersonaje as any); // Añadimos el nuevo personaje a la lista del usuario
    await user.save(); // Guardamos los cambios en la base de datos

    // 6. Enviar respuesta exitosa con los datos del usuario actualizados
    return res.status(200).json(user);

  } catch (error) {
    console.error('Error al agregar personaje:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


// --- 👇 RUTA NUEVA PARA ESTABLECER EL PERSONAJE ACTIVO 👇 ---

// PUT /users/set-active-character/:personajeId
router.put('/set-active-character/:personajeId', auth, async (req: Request, res: Response) => {
  const { personajeId } = req.params;
  const userId = req.userId;

  if (!personajeId) {
    return res.status(400).json({ error: 'Falta el parámetro personajeId.' });
  }

  try {
    // 1. Buscar al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // --- DEBUG LOGGING ---
    console.log('Buscando personajeId desde la URL:', personajeId);
    console.log('Personajes que posee el usuario:', user.personajes.map(p => p.personajeId));
    // --- END DEBUG LOGGING ---

    // 2. Verificar que el personaje le pertenece al usuario
    const personaje = user.personajes.find(p => p.personajeId === personajeId);
    if (!personaje) {
      return res.status(403).json({ error: 'No tienes permiso para activar este personaje o no existe.' });
    }

    // 3. Actualizar el personaje activo
    user.personajeActivoId = personajeId;
    await user.save();

    // 4. Enviar respuesta exitosa con el usuario actualizado
    return res.status(200).json(user);

  } catch (error) {
    console.error('Error al establecer el personaje activo:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


// --- 👇 RUTA DE DEBUG PARA VER DATOS CRUDOS 👇 ---
router.get('/debug/my-data', auth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    // Devolvemos el usuario completo, sin transformar, para ver los datos puros
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error interno al buscar datos de debug.' });
  }
});
// --- 👇 RUTA PARA ELIMINAR PERSONAJES 👇 ---

// DELETE /users/characters/:personajeId
router.delete('/characters/:personajeId', auth, async (req: Request, res: Response) => {
  const { personajeId } = req.params;
  const userId = req.userId;

  if (!personajeId) {
    return res.status(400).json({ error: 'Falta el parámetro personajeId.' });
  }

  try {
    // 1. Buscar al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // 2. Verificar que el personaje le pertenece al usuario
    const personajeIndex = user.personajes.findIndex(p => p.personajeId === personajeId);
    if (personajeIndex === -1) {
      return res.status(404).json({ error: 'Personaje no encontrado.' });
    }

    // 3. No permitir eliminar el personaje activo
    if (user.personajeActivoId === personajeId) {
      return res.status(400).json({ error: 'No puedes eliminar el personaje activo.' });
    }

    // 4. Eliminar el personaje
    user.personajes.splice(personajeIndex, 1);
    await user.save();

    // 5. Enviar respuesta exitosa
    return res.status(200).json({ 
      message: 'Personaje eliminado exitosamente.',
      personajes: user.personajes 
    });

  } catch (error) {
    console.error('Error al eliminar personaje:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


export default router;