"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import compatible con ts-jest sin resolveJsonModule ni import assertions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    return res.json({
        version: pkg.version,
        name: pkg.name,
        buildDate: process.env.BUILD_DATE || new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
exports.default = router;
