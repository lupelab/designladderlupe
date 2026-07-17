# Design Ladder TEXO · UX/UI V3

## Objetivo de esta versión

Evitar que una medición quede condicionada por interpretaciones personales. Antes de responder el diagnóstico, cada usuario debe demostrar que entiende el modelo, sabe distinguir evidencia de intención y puede aplicar la escala de forma consistente.

## Nuevo recorrido

1. **Checklist previo** (`/readiness`)
   - alcance de la evaluación;
   - período de referencia;
   - evidencia disponible;
   - mirada transversal;
   - ejemplos concretos;
   - diferencia entre intención y práctica;
   - registro de excepciones;
   - criterio neutral.

2. **Guía y simulacro** (`/training`)
   - síntesis de las seis dimensiones;
   - regla E.V.I.D.E.N.C.I.A.;
   - explicación de la escala 1 a 5;
   - brief ficticio de Agencia Nexo;
   - seis situaciones para practicar;
   - corrección contextual y explicación de cada respuesta.

3. **Examen de certificación** (`/certification`)
   - 12 casos seleccionados de un banco mayor;
   - cobertura de las seis dimensiones;
   - aprobación mínima de 80%;
   - intentos ilimitados;
   - devolución por dimensiones cuando no se aprueba;
   - trazabilidad del score, cantidad de intentos y respuestas.

4. **Diagnóstico** (`/questionnaire`)
   - solo se habilita para aplicadores certificados;
   - muestra badge de certificación y puntaje;
   - conserva contexto, autosave, criterios y revisión final;
   - incluye acceso permanente a la guía.

## Administración

En `/admin/access` ahora se puede ver:

- checklist completado;
- simulacro completado;
- estado y score de certificación;
- cantidad de intentos;
- opción para reiniciar todo el recorrido de habilitación.

## Fuente metodológica

El archivo `public/design-led-culture-playbook.pdf` queda disponible dentro de la aplicación. La guía y el examen usan contenidos originales y casos aplicados derivados de sus seis categorías y 22 principios.

## Migración obligatoria

Ejecutar después de la migración de accesos:

`supabase/migrations/20260717_qualification_journey.sql`

Agrega a `access_users`:

- `readiness_checklist`
- `readiness_completed_at`
- `guide_completed_at`
- `certification_status`
- `certification_score`
- `certification_attempts`
- `certification_answers`
- `certified_at`
- `certification_version`

## Validaciones realizadas

- build de producción correcto con Next.js 14.2.30;
- checklist guardado y recuperado;
- bloqueo de diagnóstico para usuario no certificado;
- habilitación después de aprobar el examen;
- examen de 12 preguntas corregido en servidor;
- prueba completa del recorrido con un usuario legado;
- PDF metodológico servido desde la aplicación.
