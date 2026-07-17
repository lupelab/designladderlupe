# Design Ladder TEXO · UX/UI V6

## Objetivo

Simplificar el plan de acción y el seguimiento para que funcionen como un único flujo operativo conectado directamente al diagnóstico.

## Cambios principales

### Plan y seguimiento unificados

- El menú ahora muestra un solo módulo: **Plan y seguimiento**.
- La ruta histórica `/follow-up` redirige a `/action-plan` para no romper accesos anteriores.
- Se eliminaron de la vista principal los paneles técnicos de consistencia, fases y preguntas relacionadas.

### Tablero deslizable

El tablero tiene cuatro etapas:

1. Por hacer
2. En curso
3. Validar
4. Completada

En escritorio las tarjetas se mueven arrastrándolas. En dispositivos móviles cada tarjeta incorpora un selector **Mover a**.

Mover una tarjeta actualiza automáticamente los campos internos `phase` y `status`, sin requerir cambios de base de datos.

### Acciones creadas desde el diagnóstico

Cuando se guarda un diagnóstico:

- Se calculan las tres prioridades principales.
- Se crean tres acciones vinculadas al diagnóstico.
- Las prioridades se ordenan primero por nivel de urgencia y luego por el score más bajo.
- Todas las acciones comienzan en **Por hacer**.

El tablero también intenta generar las acciones cuando se abre y detecta que el último diagnóstico todavía no tiene acciones vinculadas. Esto permite incorporar diagnósticos creados antes de esta versión.

### Edición simplificada

Cada tarjeta muestra solamente:

- Prioridad
- Dimensión
- Responsable
- Fecha
- Origen en diagnóstico
- Estado bloqueado cuando corresponda

El editor contiene únicamente título, descripción, responsable, fecha, prioridad, bloqueo y evidencia.

### Acción manual

El formulario manual se redujo a los campos esenciales. Se presenta como una función secundaria, porque el flujo principal nace del diagnóstico.

### PDF Design-Led Culture en el examen

El archivo original está disponible en:

`public/design-led-culture-playbook.pdf`

Se puede abrir:

- Desde el encabezado del módulo de certificación.
- Antes de comenzar el examen.
- Durante el examen.
- Después de recibir el resultado.

## Base de datos

Esta versión no requiere una nueva migración. Utiliza los campos existentes de `action_items`.

## Validación realizada

- TypeScript: `npx tsc --noEmit` sin errores.
- Next.js compiló correctamente, validó tipos y generó las 30 páginas estáticas. En el entorno de empaquetado, la etapa final de recolección de trazas excedió el tiempo disponible.
- Servidor de producción iniciado correctamente.
- `/login`: HTTP 200.
- `/`: redirección HTTP 307.
- `/design-led-culture-playbook.pdf`: HTTP 200.
- El PDF incluido coincide byte por byte con el archivo entregado por el usuario.
