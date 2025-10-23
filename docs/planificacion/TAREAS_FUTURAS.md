# TAREAS FUTURAS Y PRIORIDADES

## PRIORIDAD ALTA (Próximos 1-2 Meses)

### 1. Sistema de Pagos Web2
- [ ] Implementar `PurchaseService`
- [ ] Integrar Stripe
- [ ] Sistema de reembolsos
- [ ] Panel de compras responsivo
- [ ] Tienda in-game
- [ ] Webhooks y validaciones

### 2. Sistema de Pagos Web3
- [ ] Implementar infraestructura blockchain
- [ ] Sistema de nonce único
- [ ] Integración multi-blockchain
- [ ] Panel de conexión wallet
- [ ] QR para pagos móviles

### 3. Correcciones y Mejoras Críticas
- [x] Marketplace: transacciones atómicas en listar/comprar/cancelar
- [x] Marketplace: tipos y ObjectId corregidos (buyerId, consumibles/equipamiento)
- [x] Marketplace: validación de límites de inventario y metadata coherente
- [x] Marketplace: filtro de expiración en búsquedas y eliminación de broadcasts en GET
- [x] Realtime: autenticación de sockets con verificación JWT real
- [ ] Revisar y optimizar rate limiting
- [ ] Mejorar sistema de logging
- [ ] Implementar monitoreo avanzado
- [ ] Reforzar validaciones de seguridad

## PRIORIDAD MEDIA (3-6 Meses)

### 1. Sistema Social y Gremios
- [ ] Sistema de gremios jerárquico
- [ ] Chat en tiempo real
- [ ] Rankings de gremios
- [ ] Portal web de gremios
- [ ] Bases de gremio in-game

### 2. Sistema PvP
- [ ] Arena competitiva
- [ ] Matchmaking balanceado
- [ ] Rankings por temporada
- [ ] Sistema de recompensas
- [ ] Arenas temáticas

### 3. Mejoras al Marketplace
- [x] Cron de expiración automática de listings (devolución de ítems, sin reembolso destacado)
- [ ] Registro de auditoría de ventas (Transaction/Purchase) al completar una compra
- [ ] Índice de unicidad parcial: evitar múltiples listings activos del mismo item por el mismo vendedor
- [ ] Sistema de ofertas
- [ ] Sistema de subastas
- [ ] Análisis de mercado
- [ ] Sistema de reputación
- [ ] Herramientas de moderación

## PRIORIDAD BAJA (6+ Meses)

### 1. Eventos Mundiales
- [ ] Jefes de mundo
- [ ] Spawn dinámico
- [ ] Mecánicas cooperativas
- [ ] Rastreador de eventos
- [ ] Cinemáticas épicas

### 2. Sistema de Crafteo
- [ ] Árboles de habilidades
- [ ] Recetas descubribles
- [ ] Especialización única
- [ ] Guías de crafteo
- [ ] Animaciones de creación

## PROBLEMAS CONOCIDOS A RESOLVER

### Críticos (Resolver ASAP)
1. **Rate Limiting**
   - Optimizar configuración por ruta
   - Mejorar sistema de whitelist
   - Implementar cache distribuida

2. **Seguridad**
   - Reforzar validaciones de transacciones
   - Mejorar sistema anti-botting
   - Implementar más logs de seguridad

3. **Performance**
   - Optimizar queries de MongoDB
   - Implementar caching estratégico
   - Mejorar manejo de conexiones WebSocket

### Importantes (Próxima Semana)
1. **Marketplace**
   - Revisar sistema de impuestos
   - Optimizar búsquedas
   - Mejorar sistema de listings destacados

2. **Sistema de Evolución**
   - Balancear costos
   - Mejorar validaciones
   - Optimizar cálculos de stats

### Menores (Cuando sea Posible)
1. **UI/UX**
   - Mejorar mensajes de error
   - Optimizar flujos de usuario
   - Añadir más feedback visual

2. **Documentación**
   - Actualizar swagger
   - Mejorar documentación técnica
   - Crear guías de contribución

## PLAN DE ACCIÓN INMEDIATO

### Para Mañana
1. Añadir registro de auditoría de compras en marketplace (Transaction para buyer/seller)
2. Tests e2e del marketplace (listar/comprar/cancelar/expirar, inventario lleno, fondos insuficientes, doble compra)
3. Revisar y corregir rate limiting
4. Implementar mejoras de seguridad críticas
5. Optimizar queries principales

### Para esta Semana
1. Completar documentación técnica
2. Implementar mejoras del marketplace
3. Balancear sistema de evolución

### Para este Mes
1. Iniciar implementación de pagos
2. Mejorar sistema de monitoreo
3. Preparar infraestructura para sistemas sociales

## NOTAS DE IMPLEMENTACIÓN

### Estándares de Código
- Usar TypeScript estricto
- Seguir principios SOLID
- Mantener cobertura de tests > 80%
- Documentar cambios importantes

### Seguridad
- Revisar dependencias regularmente
- Mantener secrets seguros
- Actualizar certificados SSL
- Monitorear logs de seguridad

### Despliegue
- Usar CI/CD
- Mantener backups
- Implementar rollbacks
- Monitorear métricas