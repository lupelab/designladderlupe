# Design Ladder TEXO · UX/UI V5

## 1. Qué cambió en E.V.I.D.E.N.C.I.A.

El método dejó de presentarse únicamente como un acrónimo de nueve letras. La experiencia ahora lo traduce en cuatro señales simples:

1. **Existe:** hay evidencia real y reciente.
2. **Se extiende:** la práctica representa a uno, varios o todos los equipos.
3. **Se sostiene:** tiene recurrencia, responsable y seguimiento.
4. **Se usa:** influye en decisiones, procesos o resultados.

En cada pregunta del diagnóstico aparece el botón **“Ayudarme a elegir”**. Al abrirlo, la persona responde cuatro preguntas y recibe:

- Un nivel sugerido entre 1 y 5.
- La explicación de por qué se recomienda ese nivel.
- Una alerta cuando la respuesta manual se aleja demasiado de la evidencia marcada.
- Un campo opcional para registrar la evidencia o una excepción.

Las notas ingresadas se agregan al contexto de la evaluación al guardar el diagnóstico. No hace falta una nueva migración de base de datos.

La referencia completa de las nueve letras sigue disponible en un desplegable secundario.

## 2. Modo administrador de prueba

Al ingresar mediante `ADMIN_TOKEN`, la aplicación crea una sesión temporal identificada como:

- Nombre: Administrador Adlens
- Email: adlens@lupe.com.py
- Agencia: TEXO
- Rol: Administrador

Durante esta sesión:

- Todos los módulos aparecen en la navegación.
- El diagnóstico no exige certificación.
- El simulacro no exige checklist.
- El examen no exige haber completado los pasos previos.
- Se muestra una franja visible de “Modo administrador de prueba”.
- El panel de accesos tiene un botón **“Probar plataforma”**.
- El botón **“Salir del modo administrador”** elimina la sesión y vuelve al login.

Este bypass también funciona para una cuenta real cuyo rol sea `admin`.

## 3. Recorrido recomendado para probar

1. Entrar con el token administrativo.
2. En `/admin/access`, presionar **Probar plataforma**.
3. Abrir `/qualification` para revisar el recorrido completo.
4. Entrar directamente a `/training`, `/certification` o `/questionnaire`.
5. En el diagnóstico, avanzar al primer bloque y abrir **Ayudarme a elegir**.
6. Probar distintas combinaciones de evidencia y verificar la sugerencia de nivel.
7. Salir con el botón superior **Salir del modo administrador**.

## 4. Despliegue

No requiere nuevas migraciones. Conserva las migraciones de V3/V4.

Después de reemplazar el proyecto:

```bash
npm install
npm run build
```

Luego subir a GitHub y hacer un nuevo deploy en Vercel.
