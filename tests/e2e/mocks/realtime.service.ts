class DummyRealtimeService {
  notifyMarketplaceUpdate(type: string, payload: any) {
    // no-op en tests
  }
  notifyInventoryUpdate(userId: string, payload: any) {
    // no-op
  }
  notifyCharacterUpdate(userId: string, characterId: string, payload: any) {
    // no-op
  }
}

let instance: DummyRealtimeService | null = null;

export function getInstance() {
  if (!instance) instance = new DummyRealtimeService();
  return instance;
}

export default { getInstance };
