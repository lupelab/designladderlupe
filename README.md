# TEXO Innovation Culture Ladder

Plataforma de diagnóstico y seguimiento de madurez de cultura de innovación design-led para agencias TEXO.

Esta versión mantiene la estructura original del proyecto Design Ladder:

- acceso por agencia
- cuestionario estructurado
- guardado de borrador local
- scoring automático
- peldaños de madurez
- informe de resultados
- comparación con benchmark TEXO
- historial vía Google Sheets / Apps Script

## Ajuste conceptual incorporado

El diagnóstico fue adaptado al nuevo enfoque de **Design-Led Culture** basado en 6 bloques y 22 principios:

1. Liderazgo visionario
2. Liderazgo inspiracional
3. Liderazgo relacional
4. Diseño como identidad
5. Adopción del diseño
6. Innovación por diseño

Cada uno de los 22 principios fue convertido en una pregunta diagnóstica con escala 1 a 5, tooltip, ejemplo aplicado al contexto de agencias y recomendaciones automáticas.

## Nuevo posicionamiento

La plataforma deja de ser solo un diagnóstico de madurez de diseño y pasa a operar como una puerta de entrada para un producto de consultoría de innovación:

**Diagnóstico → informe ejecutivo → mapa de brechas → roadmap → pilotos → seguimiento de evolución.**

## Variables de entorno

Mantiene las mismas variables del proyecto original:

- `GSCRIPT_URL`
- `GSCRIPT_TOKEN`
- `AGENCY_SESSION_SECRET`
- `ADMIN_SESSION_SECRET`
- `ADMIN_TOKEN`
- `AGENCY_PASSWORD_ROGER`
- `AGENCY_PASSWORD_LUPE`
- `AGENCY_PASSWORD_AMPLIFY`
- `AGENCY_PASSWORD_OMD`
- `AGENCY_PASSWORD_NASTA`
- `AGENCY_PASSWORD_BRICK`
- `AGENCY_PASSWORD_ROW`
- `AGENCY_PASSWORD_BPR`

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
