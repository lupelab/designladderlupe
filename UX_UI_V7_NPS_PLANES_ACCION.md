# Design Ladder TEXO · UX/UI V7

## Módulo NPS de clientes conectado al plan de acción

Esta versión incorpora dentro de Design Ladder el dashboard contenido en `nps-complete.zip`, pero reutiliza el acceso, las agencias y el tablero operativo de la plataforma principal.

## Recorrido integrado

**Diagnóstico interno → NPS de clientes → oportunidades → tarjetas → plan y seguimiento**

El diagnóstico mide prácticas internas de cultura de innovación y diseño centrado en las personas. El NPS muestra cómo esas prácticas son percibidas por clientes. Ambos orígenes terminan en un único tablero de acciones.

## Nuevo módulo `/nps`

El módulo incluye:

- NPS de recomendación;
- variación contra el quarter anterior;
- NPS de continuidad;
- promotores, pasivos y detractores;
- reuniones solicitadas;
- fortalezas por driver;
- oportunidades priorizadas;
- aspectos más mencionados;
- temas recurrentes en comentarios;
- alertas de cuentas detractoras o con reunión solicitada;
- ranking entre agencias para usuarios TEXO y administradores.

Los miembros de una agencia ven exclusivamente sus resultados. Los administradores y usuarios TEXO pueden consultar el consolidado o elegir una agencia.

## Conversión a planes de acción

Cuando se elige una agencia, la plataforma propone hasta cuatro acciones:

1. recuperación de detractores, cuando existen;
2. mejora del driver con mayor brecha;
3. mejora del segundo driver priorizado;
4. mejora del tercer driver priorizado o cierre de la brecha de continuidad.

La persona puede seleccionar cuáles crear. Cada acción se guarda en `action_items` con:

- título y descripción basados en los resultados;
- prioridad;
- dimensión relacionada de Design Ladder;
- fecha sugerida;
- criterio de éxito;
- identificador interno del período NPS para evitar duplicados.

Las nuevas tarjetas aparecen en **Por hacer** dentro de `/action-plan` y se pueden arrastrar a En curso, Validar y Completada.

## Fuente de datos

El módulo lee la misma hoja `Respuestas` utilizada por la encuesta NPS. Se esperan 22 columnas, desde `timestamp` hasta `reunionSolicitada`, en el mismo orden del proyecto NPS original.

Variables recomendadas:

```env
NPS_GOOGLE_SHEETS_ID=
NPS_GOOGLE_SHEET_NAME=Respuestas
NPS_GOOGLE_SERVICE_ACCOUNT_EMAIL=
NPS_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

También se aceptan como respaldo las variables usadas por el dashboard NPS separado:

```env
GOOGLE_SHEETS_ID=
GOOGLE_SHEET_NAME=Respuestas
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

La cuenta de servicio debe tener acceso de lectura al Google Sheet.

## Agencia PHD

El proyecto NPS incluía PHD, pero Design Ladder todavía no la tenía en su catálogo. Esta versión agrega soporte para PHD.

Ejecutar después de las migraciones anteriores:

```text
supabase/migrations/20260718_add_phd_agency.sql
```

## Validación

- `npx tsc --noEmit`: sin errores.
- `npm run build`: compilación completa.
- 32 páginas generadas.
- Ruta nueva `/nps`.
- API nueva `/api/nps/actions`.
- `/action-plan` conserva un First Load JS de aproximadamente 109 kB.
- No se agregó una dependencia pesada de Google: la autenticación con la cuenta de servicio se realiza desde el servidor usando JWT y `fetch`.
