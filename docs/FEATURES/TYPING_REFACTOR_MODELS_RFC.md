# RFC: Refactor de Tipado de Modelos (mongoose + TypeScript)

Fecha: 2025-10-20
Autor: (auto) — lista para revisión

## Resumen

Este RFC propone un refactor incremental para mejorar el tipado de los modelos Mongoose en el backend de ValGame. El objetivo principal es declarar explícitamente el tipo de `_id` y usar `HydratedDocument`/`InferSchemaType` donde aplique, reduciendo casts repetidos en tests y código.

## Motivación

- Evitar `as any` / casts dispersos en tests y código.
- Mejorar la seguridad de tipos durante refactors futuros.
- Facilitar la lectura y reducción de bugs que surgen al confundir `string` y `ObjectId`.

## Alcance inicial

1. Modelos prioritarios: `Listing`, `User`.
2. Utilidad: `src/utils/id.ts` con helpers `idToString` y `ensureObjectId`.
3. Tests: actualizar `tests/unit` y `tests/e2e` donde exista casteo localizado.

## Enfoque técnico

- Añadir en cada interfaz de modelo la propiedad `_id: mongoose.Types.ObjectId` cuando no esté presente.
- Exportar tipos hidratados `type ListingDoc = HydratedDocument<IListing>` y usarlos donde se necesite precisión.
- Crear helper `idToString(id: unknown): string` para centralizar conversiones.

## Plan de trabajo (pasos)

1. Crear rama: `feat/typing-refactor-models`.
2. Implementar `Listing` y `User` tipados.
3. Añadir `src/utils/id.ts`.
4. Reemplazar los casts en tests críticos (marketplace tests) por helper o tipos.
5. Ejecutar y arreglar tests unitarios y e2e.
6. Abrir PR pequeño para revisión.
7. Repetir para demás modelos en PRs pequeños.

## Riesgos

- Ruptura de tests por comparación ObjectId vs string.
- PRs grandes difíciles de revisar.

## Estimación

- Fase inicial (Listing + User + helper + tests): 1–2 días.
- Refactor completo: 3–5 días.

## Comandos sugeridos

```bash
# crear rama
git checkout -b feat/typing-refactor-models

# ejecutar unit tests (solo unit)
npx jest --runInBand --detectOpenHandles --verbose --testMatch="**/tests/unit/**/*.test.ts"

# ejecutar e2e
npx jest --runInBand --detectOpenHandles --verbose tests/e2e
```

## Notas
- Mantener el casteo local en tests durante el refactor para no bloquear otros flujos.
- Dividir el trabajo en PRs pequeños por grupo de modelos.

---

Por favor revisa y dime si quieres que cree la rama y abra el PR draft automáticamente (puedo crear la rama localmente y añadir un commit con este RFC).