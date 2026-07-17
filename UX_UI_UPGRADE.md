# Design Ladder · Actualización UX/UI

## Qué cambió

### 1. Navegación y arquitectura de información
- Se reemplazó la navegación superior saturada por una barra lateral persistente.
- Se agruparon las secciones en dos categorías: trabajo y recursos.
- Se agregó estado activo por página y navegación móvil tipo drawer.
- Se diferenció con claridad el flujo principal: Diagnóstico → Plan de acción → Seguimiento → Historial.

### 2. Nueva portada ejecutiva
- Se reformuló la propuesta de valor para explicar qué resuelve el producto.
- Se agregó una visualización conceptual de la escalera de madurez.
- Se incorporaron métricas del modelo y un recorrido de cinco etapas.
- Se explicitan los resultados concretos que recibe el usuario.

### 3. Cuestionario rediseñado
- Se separó la preparación del diagnóstico de la evaluación.
- El checklist previo ahora queda guardado en el borrador local.
- Se agregó navegación lateral por dimensiones con progreso y estados completos.
- Cada pregunta muestra estado pendiente/respondida.
- La escala de respuesta tiene jerarquía numérica, descripción y confirmación visual.
- La navegación anterior/siguiente permanece disponible al final de cada bloque.
- El botón final informa exactamente qué falta antes de habilitarse.

### 4. Sistema visual
- Nuevo sistema de espaciado, radios, sombras, tipografía y estados interactivos.
- Mejor contraste, foco accesible y áreas clicables más claras.
- Componentes adaptados a desktop, tablet y mobile.
- Se mantuvieron todos los módulos y la lógica original del producto.

## Archivos principales modificados
- `src/components/AppNavigation.tsx`
- `src/components/AppShell.tsx`
- `src/app/page.tsx`
- `src/components/QuestionnaireForm.tsx`
- `src/app/globals.css`

## Validación
- Build de producción ejecutado correctamente con Next.js 14.2.30.
- Rutas públicas y autenticadas verificadas en ejecución local.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev
```

Copiar en `.env.local` los valores reales del proyecto original. El paquete entregado no incluye secretos ni credenciales.
