# TEXO Design Maturity Platform

Plataforma de diagnóstico de madurez de diseño para agencias del holding TEXO.

## Qué incluye esta versión

- cuestionario por bloques y guardado local de borrador
- lenguaje adaptado a agencias de publicidad y medios
- glosario integrado
- tooltips y ejemplos aplicados por pregunta
- resultados más desarrollados
- comparación contra referencia TEXO
- explicación del modelo y de los peldaños

## Variables necesarias

- `GSCRIPT_URL`
- `GSCRIPT_TOKEN`
- `ADMIN_TOKEN`
- `ADMIN_SESSION_SECRET`
- `AGENCY_SESSION_SECRET`
- `AGENCY_PASSWORD_ROGER`
- `AGENCY_PASSWORD_LUPE`
- `AGENCY_PASSWORD_AMPLIFY`
- `AGENCY_PASSWORD_OMD`
- `AGENCY_PASSWORD_NASTA`
- `AGENCY_PASSWORD_BRICK`
- `AGENCY_PASSWORD_ROW`
- `AGENCY_PASSWORD_BPR`

## Nota sobre benchmark TEXO

La comparación con el holding usa una referencia editable en:

`src/lib/benchmark.ts`

Si más adelante querés que el benchmark salga automáticamente de todas las agencias, habrá que extender Apps Script para listar evaluaciones cross-agency.
