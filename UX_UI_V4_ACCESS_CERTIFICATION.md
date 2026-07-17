# Design Ladder TEXO — UX/UI V4

## Cambios principales

### 1. Salida visible del modo administrador inicial

Cuando se entra con `ADMIN_TOKEN`, el encabezado muestra **Salir del modo administrador**.
El botón ejecuta `POST /api/admin/logout`, elimina las cookies de acceso y vuelve al login.

### 2. Solicitud de acceso sin contraseña

La pantalla inicial incluye la opción **Solicitar acceso sin contraseña**.
La persona completa únicamente:

- Nombre completo
- Agencia
- Email corporativo
- Cargo o función

La cuenta queda en estado `pending` con una credencial interna aleatoria que nunca se entrega.

### 3. Aprobación y generación de clave temporal

En `/admin/access`, el botón para solicitudes pendientes se llama **Aprobar y generar clave**.
Al usarlo, el sistema:

1. aprueba la cuenta;
2. genera una contraseña temporal;
3. la muestra una sola vez al administrador;
4. obliga a la persona a cambiarla en el primer ingreso.

Para crear al administrador principal:

1. Solicitar acceso con `adlens@lupe.com.py`.
2. Entrar al panel con `ADMIN_TOKEN`.
3. En la solicitud, seleccionar agencia `TEXO` y permiso `Administrador`.
4. Presionar **Aprobar y generar clave**.
5. Copiar la clave temporal.
6. Presionar **Salir del modo administrador**.
7. Ingresar con `adlens@lupe.com.py` y la clave temporal.
8. Crear la contraseña definitiva.

### 4. Certificación inicial de una sola vez

El examen tiene 30 preguntas de opción múltiple:

- 5 de Liderazgo visionario
- 5 de Liderazgo inspirador
- 5 de Liderazgo relacional
- 5 de Diseño como identidad
- 5 de Adopción del diseño
- 5 de Innovación por diseño

Se aprueba con 80%, equivalente a 24 respuestas correctas.

Después de aprobar:

- la certificación queda asociada a la cuenta;
- el examen ya no puede volver a iniciarse;
- la pantalla muestra el certificado y el resultado registrado;
- solamente un administrador puede reiniciar la habilitación.

La evaluación se divide en seis bloques de cinco preguntas para reducir carga cognitiva.

## Base técnica

No hace falta una migración adicional respecto de V3. Se siguen utilizando:

- `20260716_access_management.sql`
- `20260717_qualification_journey.sql`

## Validaciones realizadas

- TypeScript: `npx tsc --noEmit` correcto.
- Compilación Next.js: código compilado, tipado y páginas estáticas generadas correctamente en el entorno de validación.
