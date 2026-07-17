# Design Ladder TEXO · UX/UI V2

## Qué cambia

### 1. Acceso como primera experiencia
- `/` redirige a `/login` cuando no existe una sesión.
- Login con email y contraseña.
- Solicitud de cuenta con estado pendiente.
- Flujo de recuperación de contraseña.
- Contraseña temporal con cambio obligatorio al ingresar.
- Compatibilidad con el acceso heredado por agencia durante la transición.

### 2. Administración de accesos
Ruta: `/admin/access`

Permite:
- ver solicitudes pendientes;
- aprobar, rechazar, suspender y reactivar;
- corregir la agencia asignada;
- convertir a un usuario en administrador;
- atender solicitudes de recuperación;
- generar una contraseña temporal visible una sola vez.

### 3. Nuevo diagnóstico
- Introducción que explica qué se mide y cómo responder.
- Agencia tomada de la sesión.
- Compromiso explícito de responder con evidencia.
- Navegación por siete etapas: contexto, seis dimensiones y revisión.
- Autosave visible.
- Progreso general y progreso por dimensión.
- Ejemplos y criterios de evidencia dentro de cada pregunta.
- Revisión completa antes de calcular.
- Prevención de envíos incompletos.

### 4. Procesamiento y tranquilidad
Al generar el diagnóstico aparece una pantalla de progreso con:
- spinner circular;
- porcentaje;
- etapa actual;
- barra lineal;
- mensajes que explican que las respuestas ya fueron guardadas.

La misma lógica se utiliza cuando el usuario solicita una profundización con IA.

### 5. Resultados sin dependencia de IA
El score, el peldaño, la lectura, el benchmark, las brechas y las recomendaciones son calculados mediante reglas y contenidos predefinidos.

La IA:
- no se ejecuta automáticamente;
- no cambia el puntaje;
- no reemplaza las recomendaciones base;
- se ofrece como una profundización opcional.

## Configuración obligatoria

### A. Ejecutar la migración de Supabase
Abrir el SQL Editor del proyecto y ejecutar:

`supabase/migrations/20260716_access_management.sql`

Esto crea:
- `access_users`
- `password_reset_requests`

### B. Variables de entorno
Configurar:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

ACCESS_SESSION_SECRET=
ADMIN_SESSION_SECRET=
ADMIN_TOKEN=

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
```

`ACCESS_SESSION_SECRET` y `ADMIN_SESSION_SECRET` deben ser cadenas largas y aleatorias.

### C. Primer administrador
1. Entrar a `/login`.
2. Abrir “Acceso administrativo inicial”.
3. Ingresar el valor de `ADMIN_TOKEN`.
4. Aprobar la primera cuenta.
5. Cambiar su permiso a `Administrador`.

A partir de ese momento esa persona puede ingresar normalmente con email y contraseña.

## Compatibilidad temporal
Las variables `AGENCY_PASSWORD_*` siguen funcionando con la ruta heredada, pero el nuevo flujo recomendado es crear cuentas individuales y aprobarlas desde el panel.

## Validación técnica
- Build de producción ejecutado correctamente con `npm run build`.
- Rutas privadas protegidas por middleware y validación del servidor.
- No se incluyen credenciales reales en el ZIP.
