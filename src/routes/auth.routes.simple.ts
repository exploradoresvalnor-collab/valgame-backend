import { Router } from 'express';

const router = Router();

// Ruta simple de test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes simple funciona' });
});

export default router;