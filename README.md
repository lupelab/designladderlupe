# Design Ladder TEXO

Plataforma para preparar aplicadores, diagnosticar, interpretar y mejorar la cultura de innovación y diseño centrado en las personas dentro de las agencias TEXO.

## Recorrido del producto

**Acceso → preparación → certificación → diagnóstico interno → NPS de clientes → plan de acción unificado → seguimiento → nueva medición**

## Funcionalidades principales

- cuentas individuales con aprobación administrativa;
- panel de accesos, recuperación de contraseñas y estado de certificación;
- checklist previo de preparación y evidencia;
- guía de aplicación basada en el playbook de cultura de diseño;
- simulacro de respuestas con un brief de agencia;
- certificación de 30 preguntas equilibradas sobre las 6 dimensiones y 22 principios;
- bloqueo del diagnóstico hasta aprobar con al menos 80%;
- diagnóstico guiado con autosave y revisión antes de enviar;
- scoring y resultados determinísticos;
- recomendaciones predefinidas;
- profundización opcional con IA;
- benchmark TEXO, plan de acción, responsables, evidencia e historial;
- módulo NPS de clientes conectado al mismo Google Sheet de la encuesta;
- conversión de detractores y brechas NPS en tarjetas del plan de seguimiento.

## Instalación

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
npm run start
```

## Configuración de accesos y certificación

1. Ejecutar `supabase/migrations/20260716_access_management.sql`.
2. Ejecutar `supabase/migrations/20260717_qualification_journey.sql`.
3. Completar `.env.local` usando `.env.example`.
4. Usar `ADMIN_TOKEN` en el acceso administrativo inicial.
5. Aprobar las cuentas desde `/admin/access`.

Revisar `UX_UI_V3_QUALIFICATION.md` para la guía completa.

## V4 — acceso y certificación

- Solicitud de acceso sin contraseña.
- Aprobación administrativa con clave temporal.
- Botón visible para salir del modo administrador inicial.
- Certificación equilibrada de 30 preguntas, aprobada una sola vez.
- Guía detallada en `UX_UI_V4_ACCESS_CERTIFICATION.md`.


## V7 — NPS de clientes y acciones

- Nuevo módulo `/nps`.
- Lectura directa del Google Sheet de respuestas NPS.
- Vista consolidada TEXO y vista restringida por agencia.
- Fortalezas, drivers, detractores, comentarios y ranking.
- Conversión de resultados NPS en tarjetas dentro de `/action-plan`.
- Soporte para PHD mediante `supabase/migrations/20260718_add_phd_agency.sql`.
- Configuración detallada en `UX_UI_V7_NPS_PLANES_ACCION.md`.
