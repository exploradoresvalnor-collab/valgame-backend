import { Router } from 'express';
// Import compatible con ts-jest sin resolveJsonModule ni import assertions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

const router = Router();

router.get('/', (_req, res) => {
  return res.json({
    version: pkg.version,
    name: pkg.name,
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
