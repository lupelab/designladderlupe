# UX/UI V8 · Acceso completo

## Cambio de criterio

El checklist, la guía, el simulacro y el examen dejan de ser requisitos obligatorios. Toda cuenta aprobada puede acceder desde el primer ingreso a:

- Diagnóstico Design Ladder.
- NPS de clientes.
- Resultados e historial.
- Plan y seguimiento.
- Recursos, guía, playbook y certificación.

## Comportamiento

- El inicio de sesión de miembros dirige al dashboard.
- El cambio de contraseña dirige al dashboard.
- `/questionnaire` no valida certificación.
- `/training` no exige checklist.
- `/certification` no exige checklist ni simulacro.
- La API del examen permite rendir directamente.
- Los recursos previos siguen registrando el avance y la certificación conserva su lógica, pero no condicionan el acceso.

## Mensajes de experiencia

El dashboard informa que el acceso está liberado. El módulo de preparación se presenta como centro de aprendizaje opcional y el diagnóstico identifica si la certificación está registrada sin afirmar que sea necesaria.
