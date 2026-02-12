"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = getInstance;
class DummyRealtimeService {
    notifyMarketplaceUpdate(type, payload) {
        // no-op en tests
    }
    notifyInventoryUpdate(userId, payload) {
        // no-op
    }
    notifyCharacterUpdate(userId, characterId, payload) {
        // no-op
    }
}
let instance = null;
function getInstance() {
    if (!instance)
        instance = new DummyRealtimeService();
    return instance;
}
exports.default = { getInstance };
