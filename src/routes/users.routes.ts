import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { auth } from '../middlewares/auth';
import BaseCharacter from '../models/BaseCharacter'; // Importamos el modelo de personajes base para validación

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

  res.json(user);
});


// --- 👇 RUTA NUEVA PARA AÑADIR PERSONAJES 👇 ---

// POST /users/characters/add
router.post('/characters/add', auth, async (req: Request, res: Response) => {
  const { personajeId, rango } = req.body;
  const userId = req.userId;

  // 1. Validaciones de entrada
  if (!personajeId || !rango) {
    return res.status(400).json({ error: 'Faltan los campos personajeId o rango.' });
  }

  const rangosValidos = ["D", "C", "B", "A", "S", "SS", "SSS"];
  if (!rangosValidos.includes(rango)) {
    return res.status(400).json({ error: `El rango '${rango}' no es válido.` });
  }

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


export default router;