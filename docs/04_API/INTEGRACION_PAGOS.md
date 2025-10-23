# Integración de pagos (MVP) — Web2 + preparación Web3

Este documento describe el contrato mínimo para integrar pagos en la `store` del juego (tienda oficial) y cómo dejar preparado el sistema para pagos on-chain (web3).

## Conceptos

- Store (tienda): canal oficial para comprar paquetes/ofertas con dinero real (web2) o con on-chain payments. Entrega VAL / paquetes / ítems.
- Marketplace: mercado P2P entre usuarios usando VAL (ya implementado en `marketplace.service`).

## Flujo mínimo (Web2 — ejemplo: Bold/Stripe)

1. Frontend solicita creación de checkout al backend: POST /api/payments/checkout { userId, paqueteId, valorUSDT }
2. Backend crea session de pago con el proveedor y devuelve `checkoutUrl` y `externalPaymentId`.
3. Usuario completa el pago en el proveedor.
4. Proveedor envía webhook a POST /api/payments/webhook con payload firmado.
5. Backend valida la firma, busca `externalPaymentId`. Si no existe, crea `Purchase` y marca `paymentStatus: succeeded`, acredita `valRecibido` y asigna paquete. Si existe, es idempotente y actualiza el estado.

## Web3 (on-chain) — preparación

- Aceptar pagos on-chain implica validar transacción en la cadena. Opciones:
  - Backend verifica txHash y confirma (confirmaciones >= N) antes de ejecutar entrega.
  - Usar relayer/indexer que llame al endpoint webhook cuando detecte evento.
- Campos necesarios en `Purchase`: `onchainTxHash`, `paymentProvider='onchain'`.

## Contrato webhook (MVP)

- Endpoint: POST /api/payments/webhook
- Headers: X-Signature (firma del proveedor) — validar en producción
- Body (ejemplo):

```json
{
  "externalPaymentId": "BOLD_12345",
  "status": "succeeded",
  "userId": "650...",
  "paqueteId": "paquete-pionero",
  "valorPagadoUSDT": 5.0,
  "valRecibido": 50,
  "onchainTxHash": "0xabc123..." // opcional
}
```

Idempotencia: `externalPaymentId` debe ser único por intento de pago; el webhook debe ser seguro contra reenvíos y el backend debe ignorar duplicados o actualizar status sin duplicar `Purchase`.

## Tareas de implementación posteriores (post-MVP)

1. Validar firma/headers del proveedor (doc de Bold/Stripe). No confiar en el body tal cual.
2. Registrar `paymentProvider` y `externalPaymentId` en `Purchase` para conciliación.
3. Implementar proceso batch de conciliación y alertas.
4. Añadir pruebas E2E que mockeen webhooks y verifiquen entrega.
5. Preparar flow on-chain: relayer + verificación de confirmaciones.

## Endpoints propuestos

- POST /api/payments/checkout -> crear orden (frontend)
- POST /api/payments/webhook -> recibir notificaciones del proveedor
- (opcional) GET /api/payments/status/:externalPaymentId -> consultar estado de pago

---

Si quieres, implemento el endpoint de status y un test E2E que simule el webhook de Bold para el MVP. También puedo añadir un campo `externalPaymentId` obligatorio al crear checkout para forzar idempotencia desde el frontend.
