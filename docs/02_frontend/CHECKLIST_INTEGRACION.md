# Checklist de Integración Front (Angular 17)

## Preparación
- [ ] Configurar `API_URL` y CORS en backend/front.
- [ ] Interceptor JWT (Authorization: Bearer).
- [ ] Servicio `ApiService` y `WebsocketService` (Socket.IO con token).

## Orden sugerido
1) **Autenticación y onboarding** → ver `AUTH_AND_FLOWS.md`
   - [ ] Implementar registro/login/verificación/recuperación

2) **Inventarios y Paquetes** → ver `05_TIENDA_Y_PAQUETES.md`
   - [ ] Listar y abrir paquetes

3) **Marketplace P2P** → ver `06-Marketplace-P2P.md`
   - [ ] Listado/compra/cancelación + WS

4) **Dungeons (RPG)** → ver `11_COMBATE_Y_DUNGEONS.md`
   - [ ] Entrada y progreso con WS

5) **Survival Mode** → ver `ENDPOINTS_CATALOG.md`
   - [ ] Sesiones survival, oleadas, canjes

6) **Rankings** → ver `11_COMBATE_Y_DUNGEONS.md`
   - [ ] Posición personal y leaderboards

7) **Teams** → ver `ENDPOINTS_CATALOG.md`
   - [ ] Gestión de equipos

8) **Notifications** → ver `ENDPOINTS_CATALOG.md`
   - [ ] Centro de notificaciones

9) **Settings & Profile** → ver `ENDPOINTS_CATALOG.md`
   - [ ] Configuración de usuario

## Errores y límites
- [ ] Manejar 401/403/404/409/422/429/5xx
- [ ] Backoff en 429 y retires en 5xx controlados

## Validación final
- [ ] E2E: registro → personaje → abrir paquete → comprar → dungeon → victoria → ranking actualizado
