import { DimensionKey, DimensionScore, LadderStep, RecommendationBlock } from '@/lib/types';
import { DIMENSION_LABELS } from '@/lib/questionnaire';

const PLAYBOOK: Record<DimensionKey, { rationale: string; low: string[]; mid: string[]; high: string[] }> = {
  visionary: {
    rationale: 'La innovación necesita un norte compartido, sponsorship visible y capacidad de ajustar estrategia cuando cambian usuarios y mercado.',
    low: ['Definir una visión simple de innovación y customer centricity para la agencia.', 'Alinear a líderes en una sesión de sponsorship y criterios de decisión.', 'Elegir 2 desafíos donde la visión se traduzca en decisiones concretas.'],
    mid: ['Instalar una revisión trimestral de estrategia de innovación.', 'Pedir evidencia de usuarios en iniciativas prioritarias.', 'Nombrar sponsors por frente o territorio de innovación.'],
    high: ['Conectar la visión design-led con portfolio y nuevas ofertas.', 'Medir impacto de innovación en crecimiento, retención o eficiencia.', 'Usar la visión como marco para decisiones de inversión y talento.'],
  },
  inspirational: {
    rationale: 'La cultura se instala cuando los líderes modelan comportamientos, aprenden del error y celebran ejemplos concretos.',
    low: ['Organizar encuentros directos entre líderes y usuarios/clientes.', 'Hacer una retrospectiva sin culpa sobre un proyecto reciente.', 'Recolectar y contar un primer caso interno de diseño en acción.'],
    mid: ['Crear una rutina mensual de historias de aprendizaje.', 'Definir reglas claras para experimentar y aprender del error.', 'Incluir a líderes en al menos un research, discovery o test por trimestre.'],
    high: ['Convertir historias de innovación en activos de cultura interna.', 'Reconocer públicamente comportamientos design-led.', 'Formar líderes como facilitadores de aprendizaje y experimentación.'],
  },
  relational: {
    rationale: 'Sin seguridad psicológica y relaciones de confianza, la información crítica no llega a tiempo y las ideas no ganan adopción.',
    low: ['Crear un espacio seguro para levantar fricciones de proceso.', 'Asegurar respuesta visible a feedback del equipo.', 'Socializar cambios antes de imponer nuevos procesos.'],
    mid: ['Instalar retrospectivas con compromisos de acción.', 'Entrenar a líderes en escucha y preguntas abiertas.', 'Mapear resistencias y aliados por cada iniciativa de cambio.'],
    high: ['Usar relaciones internas como acelerador de adopción.', 'Medir confianza y calidad de feedback entre áreas.', 'Crear comunidades internas de práctica design-led.'],
  },
  identity: {
    rationale: 'La innovación se vuelve sostenible cuando pasa a formar parte de valores, decisiones de personas y representación sistemática del usuario.',
    low: ['Traducir customer centricity a comportamientos esperados por rol.', 'Incluir voz del usuario en reuniones clave de proyectos.', 'Mapear el ecosistema de usuarios de una cuenta o servicio prioritario.'],
    mid: ['Incorporar comportamientos design-led en onboarding y evaluación.', 'Crear una rutina de insights de clientes y audiencias.', 'Definir responsables de traer la voz del usuario a decisiones importantes.'],
    high: ['Integrar diseño e innovación en prácticas de talento y liderazgo.', 'Convertir la voz del usuario en input permanente de dirección.', 'Usar el ecosistema de usuarios para detectar nuevas oportunidades de negocio.'],
  },
  adoption: {
    rationale: 'El diseño escala cuando se vuelve fácil de usar, útil para procesos internos y reforzado por autonomía y rituales.',
    low: ['Crear una guía simple de discovery/prototipado para equipos no especialistas.', 'Rediseñar un proceso interno usando feedback de quienes lo usan.', 'Definir qué decisiones pueden tomar los equipos sin escalar.'],
    mid: ['Instalar rituales de aprendizaje, demos o huddles mensuales.', 'Crear kits simples para briefs, tests y retrospectivas.', 'Dar autonomía con límites claros para pilotos de mejora.'],
    high: ['Escalar herramientas design-led a toda la agencia.', 'Medir adopción de rituales y calidad de decisiones autónomas.', 'Formar champions internos por área o agencia.'],
  },
  innovation: {
    rationale: 'La innovación por diseño combina prototipos rápidos, diversidad de perspectivas, paciencia con ambigüedad y mejora continua.',
    low: ['Seleccionar un piloto pequeño para prototipar en 30 días.', 'Probar una hipótesis con usuarios antes de escalar.', 'Hacer una sesión cross-funcional para enriquecer una solución.'],
    mid: ['Crear checkpoints de aprendizaje en proyectos piloto.', 'Definir criterios para decidir qué prototipos escalan.', 'Separar espacios de exploración de la operación diaria.'],
    high: ['Construir un portfolio de experimentos y aprendizajes.', 'Medir mejora continua y aprendizajes como indicadores de innovación.', 'Transformar capacidades internas en una oferta consultiva para corporaciones.'],
  },
};

export function getDimensionRecommendations(scores: DimensionScore, ladderStep: LadderStep): RecommendationBlock[] {
  return (Object.keys(PLAYBOOK) as DimensionKey[]).map((key) => {
    const score = Number(scores?.[key] ?? 0);
    const library = PLAYBOOK[key];

    let priority: 'Alta' | 'Media' | 'Baja' = 'Baja';
    let headline = 'Fortalecer y escalar';
    let actions = library.high;

    if (score < 2.5) {
      priority = 'Alta';
      headline = 'Construir base cultural y operativa';
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
