"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, _res, next) => {
    const start = Date.now();
    const originalSend = _res.send;
    _res.send = function (data) {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            path: req.path,
            status: _res.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        };
        if (process.env.LOG_REQUESTS === 'true') {
            console.log(`[${log.timestamp}] ${log.method} ${log.path} - ${log.status} (${log.duration})`);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
