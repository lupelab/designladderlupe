import { DIMENSION_LABELS } from '@/lib/questionnaire';
import { DimensionKey, DimensionScore, LadderStep, RecommendationBlock } from '@/lib/types';

const PLAYBOOK: Record<DimensionKey, { rationale: string; low: string[]; mid: string[]; high: string[] }> = {
  strategy: {
    rationale: 'Sin patrocinio, objetivos y métricas, diseño queda como servicio táctico y no como palanca de negocio.',
    low: ['Nombrar un sponsor ejecutivo para diseño.', 'Definir una visión de diseño conectada con 3 objetivos de negocio.', 'Crear un dashboard mínimo con 3 KPIs de diseño.'],
    mid: ['Incluir diseño en la priorización trimestral.', 'Vincular iniciativas de diseño a impacto comercial o eficiencia.', 'Estandarizar criterios de priorización entre negocio y diseño.'],
    high: ['Usar diseño en decisiones de portfolio e innovación.', 'Instalar governance de diseño con revisión ejecutiva mensual.', 'Convertir métricas de diseño en input de dirección.'],
  },
  process: {
    rationale: 'La madurez sube cuando diseño entra antes, trabaja con método y reduce retrabajo.',
    low: ['Implementar un brief estándar para todos los proyectos.', 'Definir fases mínimas: discovery, exploración, validación, entrega.', 'Crear reviews obligatorias de calidad antes del handoff.'],
    mid: ['Formalizar rituales semanales de revisión y seguimiento.', 'Alinear handoff entre diseño, cuentas y tecnología.', 'Medir retrabajo y causas de fricción entre áreas.'],
    high: ['Escalar un playbook transversal de proyecto.', 'Optimizar tiempos de ciclo y eficiencia del proceso.', 'Usar métricas operativas para mejorar predictibilidad.'],
  },
  research: {
    rationale: 'Sin evidencia de usuarios y mercado, el diseño mejora forma, pero no necesariamente resultados.',
    low: ['Introducir tests ligeros antes de lanzar piezas o experiencias.', 'Centralizar hallazgos en una biblioteca simple de insights.', 'Definir hipótesis por proyecto y validarlas con datos.'],
    mid: ['Integrar research en discovery y post-lanzamiento.', 'Unificar fuentes de evidencia cuantitativa y cualitativa.', 'Crear una rutina de aprendizaje reusable por tipo de proyecto.'],
    high: ['Usar insights para descubrir nuevas oportunidades.', 'Cruzar research con métricas de negocio para priorización.', 'Convertir research en activo estratégico compartido.'],
  },
  craft: {
    rationale: 'El craft sostiene percepción de valor, consistencia y credibilidad, pero debe estar sistematizado.',
    low: ['Definir criterios mínimos de calidad visual.', 'Crear templates base y componentes reutilizables.', 'Instalar sesiones quincenales de crítica de diseño.'],
    mid: ['Fortalecer librerías, patrones y consistencia multi-canal.', 'Estandarizar feedback y checklist de calidad.', 'Elevar accesibilidad, jerarquía y claridad visual.'],
    high: ['Escalar design system según casos de uso.', 'Medir consistencia y velocidad de producción.', 'Desarrollar craft especializado por disciplina.'],
  },
  operations: {
    rationale: 'La madurez no escala sin estructura, claridad de roles, capacidad y gobierno.',
    low: ['Definir ownerships y expectativas por rol.', 'Visibilizar backlog, bloqueos y capacidad del equipo.', 'Crear reglas claras de intake y priorización.'],
    mid: ['Ajustar capacity planning según demanda real.', 'Instalar governance operativo con SLAs o acuerdos de servicio.', 'Diseñar un plan de desarrollo de talento.'],
    high: ['Conectar staffing, calidad y rentabilidad.', 'Prever necesidades futuras de capacidad y perfiles.', 'Escalar gobierno y reporting de operación.'],
  },
};

export function getDimensionRecommendations(scores: DimensionScore, ladderStep: LadderStep): RecommendationBlock[] {
  return Object.entries(scores).map(([dimension, score]) => {
    const key = dimension as DimensionKey;
    const library = PLAYBOOK[key];

    let priority: 'Alta' | 'Media' | 'Baja' = 'Baja';
    let headline = 'Fortalecer y escalar';
    let actions = library.high;

    if (score < 2.5) {
      priority = 'Alta';
      headline = 'Cerrar brecha estructural';
      actions = library.low;
    } else if (score < 3.7) {
      priority = ladderStep <= 2 ? 'Alta' : 'Media';
      headline = 'Sistematizar y profesionalizar';
      actions = library.mid;
    }

    return {
      dimension: key,
      label: DIMENSION_LABELS[key],
      priority,
      headline,
      rationale: library.rationale,
      actions,
    };
  });
}

export function getTopPriorities(scores: DimensionScore, ladderStep: LadderStep) {
  return getDimensionRecommendations(scores, ladderStep)
    .sort((a, b) => {
      const priorityRank = { Alta: 0, Media: 1, Baja: 2 };
      return priorityRank[a.priority] - priorityRank[b.priority] || a.label.localeCompare(b.label);
    })
    .slice(0, 3);
}
