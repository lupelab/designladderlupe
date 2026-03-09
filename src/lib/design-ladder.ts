import { DimensionKey, DimensionScore, LadderStep } from '@/lib/types';
import { DIMENSION_LABELS } from '@/lib/questionnaire';

export const STEP_COPY: Record<LadderStep, {
  title: string;
  shortName: string;
  summary: string;
  implication: string;
  signals: string[];
  nextMove: string;
}> = {
  1: {
    title: 'Peldaño 1 · Diseño inexistente o reactivo',
    shortName: 'Diseño reactivo',
    summary: 'El diseño todavía aparece tarde, se activa por urgencia y no funciona como una capacidad integrada al negocio.',
    implication: 'El foco inmediato es construir base: briefs más claros, mejores handoffs, mayor visibilidad del trabajo y una entrada más temprana del diseño en las conversaciones importantes.',
    signals: [
      'El trabajo depende de personas puntuales más que de un sistema.',
      'Diseño suele entrar al final, cuando la solución ya está decidida.',
      'Hay retrabajo, baja trazabilidad y aprendizaje poco documentado.',
    ],
    nextMove: 'Ordenar la base operativa y asegurar que diseño participe antes de ejecutar.',
  },
  2: {
    title: 'Peldaño 2 · Diseño como styling',
    shortName: 'Diseño como styling',
    summary: 'El diseño aporta valor visual y creativo, pero todavía influye poco en la definición del problema, el proceso o la estrategia.',
    implication: 'El siguiente salto es pasar de una lógica estética a una lógica de proceso: discovery, insights, colaboración más temprana y mejores criterios de priorización.',
    signals: [
      'La calidad visual puede ser buena, pero no siempre está conectada con decisiones de negocio.',
      'La empatía con clientes y prospectos ocurre de manera inconsistente.',
      'El diseño aún no guía el armado de soluciones o productos nuevos de forma sistemática.',
    ],
    nextMove: 'Integrar discovery, research e indicadores para mover diseño hacia una función más estructural.',
  },
  3: {
    title: 'Peldaño 3 · Diseño como proceso',
    shortName: 'Diseño como proceso',
    summary: 'El diseño ya participa de forma consistente en el flujo de trabajo y ayuda a mejorar calidad, eficiencia y claridad de las soluciones.',
    implication: 'Para avanzar, hay que hacer que el sistema sea más estratégico: más incidencia en portfolio, más uso de insights, más gobierno y medición de impacto.',
    signals: [
      'Hay una forma de trabajo más repetible y menos improvisada.',
      'La colaboración entre áreas empieza a sostener mejores resultados.',
      'Todavía hay espacio para que diseño incida más en nuevas ofertas y decisiones de negocio.',
    ],
    nextMove: 'Conectar diseño con estrategia, métricas y decisiones de crecimiento.',
  },
  4: {
    title: 'Peldaño 4 · Diseño como estrategia',
    shortName: 'Diseño como estrategia',
    summary: 'El diseño ya opera como una capacidad que influye en innovación, construcción de soluciones, experiencia de clientes y ventaja competitiva.',
    implication: 'El foco deja de ser “ordenar la base” y pasa a ser cómo sostener la disciplina, escalar lo que funciona y transformar esa capacidad en un activo diferencial del holding.',
    signals: [
      'Diseño participa en decisiones relevantes sobre negocio, oferta y transformación.',
      'El sistema combina calidad creativa con proceso, aprendizaje y gobierno.',
      'Existe mayor capacidad para crear soluciones nuevas y más centradas en cliente.',
    ],
    nextMove: 'Escalar la ventaja, sofisticar portfolio y sostener la mejora continua como disciplina de management.',
  },
};

export function getDimensionInterpretation(dimension: DimensionKey, score: number) {
  const label = DIMENSION_LABELS[dimension];

  if (score < 2) {
    return `${label} hoy funciona de forma muy incipiente. La capacidad existe de manera reactiva o aislada y todavía no alcanza para sostener una transformación consistente.`;
  }

  if (score < 3) {
    return `${label} ya muestra señales de desarrollo, pero la práctica todavía es inconsistente. Aparece en algunos casos y en otros no, lo que genera una experiencia desigual.`;
  }

  if (score < 4) {
    return `${label} ya está bastante instalada. Se ve una práctica repetible y con cierta madurez, aunque todavía hay margen para volverla más medible, más escalable y más estratégica.`;
  }

  return `${label} es hoy una fortaleza del sistema. La capacidad está presente, se sostiene con bastante consistencia y puede actuar como palanca para acelerar otras dimensiones.`;
}

export function buildNarrativeFromScores(step: LadderStep, scores: DimensionScore) {
  const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
  const strongest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  const weakLabel = DIMENSION_LABELS[weakest[0] as DimensionKey];
  const strongLabel = DIMENSION_LABELS[strongest[0] as DimensionKey];

  const opener = STEP_COPY[step].summary;
  return `${opener} En esta lectura, ${strongLabel.toLowerCase()} aparece como una capacidad relativamente más desarrollada, mientras que ${weakLabel.toLowerCase()} sigue actuando como una de las brechas que más condiciona el salto al siguiente nivel.`;
}
