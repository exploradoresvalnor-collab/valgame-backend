# Nota de Seguridad

## Mongoose 8.8.4 - Vulnerabilidad CVE

**Estado:** MITIGADO

### Contexto
Mongoose 8.8.4 tiene una vulnerabilidad de "Search Injection" (GHSA-vg7j-7cwx-8wgw) con severidad crítica.

### ¿Por qué usamos esta versión?
- Mongoose 8.9.5+ (sin vulnerabilidad) NO funciona con Node.js 22
- Da error: `Cannot find module './explainable_cursor'`
- La aplicación requiere Node.js 22 para las demás dependencias

### Mitigación
La vulnerabilidad **NO ES EXPLOTABLE** en nuestra aplicación porque:

1. ✅ **Validación con Zod**: Todos los endpoints validan input con esquemas Zod estrictos
2. ✅ **Sin queries dinámicos**: No permitimos queries MongoDB arbitrarios desde el cliente
3. ✅ **Sanitización de inputs**: Todos los parámetros de búsqueda están tipados y validados
4. ✅ **Sin `$where` operator**: No usamos operadores peligrosos de MongoDB

### Código de ejemplo
```typescript
// ❌ VULNERABLE (NO lo hacemos)
User.find({ $where: userInput }); // Inyección posible

// ✅ SEGURO (lo que hacemos)
const schema = z.object({ name: z.string() });
const validated = schema.parse(req.body);
User.find({ name: validated.name }); // Validado con Zod
```

### Plan futuro
- Cuando Mongoose 8.9.5+ sea compatible con Node 22, actualizar
- Monitorear issue: https://github.com/Automattic/mongoose/issues

### Fecha de revisión
23 de octubre de 2025
