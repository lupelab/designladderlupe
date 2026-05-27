import { DimensionKey, DimensionScore, LadderStep } from '@/lib/types';
import { DIMENSIONS, DIMENSION_LABELS } from '@/lib/questionnaire';

export const STEP_COPY: Record<LadderStep, {
  title: string;
  shortName: string;
  summary: string;
  implication: string;
  signals: string[];
  nextMove: string;
}> = {
  1: {
    title: 'Peldaño 1 · Innovación reactiva',
    shortName: 'Innovación reactiva',
    summary: 'La innovación aparece de forma aislada, tardía o dependiente de algunas personas, sin una base cultural ni operativa clara.',
    implication: 'El foco inmediato es construir condiciones mínimas: visión común, liderazgo visible, conversaciones honestas y herramientas simples para empezar a trabajar desde usuarios.',
    signals: [
      'Las iniciativas surgen como respuesta a urgencias más que como sistema.',
      'El diseño y la innovación todavía no están instalados en rituales, decisiones o responsabilidades.',
      'Hay poco espacio para prototipar, aprender o cuestionar supuestos antes de ejecutar.',
    ],
    nextMove: 'Crear una base cultural y operativa mínima para que la innovación deje de depender de voluntades individuales.',
  },
  2: {
    title: 'Peldaño 2 · Innovación táctica',
    shortName: 'Innovación táctica',
    summary: 'Existen esfuerzos visibles de innovación y customer centricity, pero todavía son inconsistentes y dependen de proyectos, líderes o equipos específicos.',
    implication: 'El siguiente salto es convertir buenas intenciones en prácticas repetibles: sponsorship, rituales, escucha activa, voz del usuario y autonomía con límites claros.',
    signals: [
      'Hay proyectos o casos interesantes, pero todavía no forman un sistema común.',
      'La cultura design-led aparece en algunos equipos y se pierde en otros.',
      'La orientación a usuarios existe, aunque no siempre influye en decisiones clave.',
    ],
    nextMove: 'Sistematizar los principios design-led y convertirlos en comportamientos observables en toda la agencia.',
  },
  3: {
    title: 'Peldaño 3 · Innovación como proceso',
    shortName: 'Innovación como proceso',
    summary: 'La agencia ya cuenta con prácticas repetibles para innovar, aprender y trabajar desde usuarios, aunque todavía puede ganar profundidad estratégica.',
    implication: 'Para avanzar, hay que conectar la cultura de innovación con estrategia, modelo de negocio, desarrollo de talento, métricas y portafolio de nuevas soluciones.',
    signals: [
      'Hay rituales, lenguaje y herramientas compartidas.',
      'Los equipos colaboran mejor y pueden aprender de pilotos o experimentos.',
      'Todavía hay margen para que innovación influya más en decisiones de crecimiento y portfolio.',
    ],
    nextMove: 'Conectar innovación cultural y operativa con decisiones estratégicas del negocio.',
  },
  4: {
    title: 'Peldaño 4 · Innovación estratégica design-led',
    shortName: 'Innovación estratégica',
    summary: 'La innovación funciona como una capacidad estratégica: guía cultura, decisiones, experiencias, procesos y nuevas oportunidades de negocio.',
    implication: 'El foco deja de ser instalar la base y pasa a ser sostener la ventaja: escalar prácticas, desarrollar nuevos productos consultivos y medir impacto con más sofisticación.',
    signals: [
      'La dirección usa diseño e innovación para decidir, priorizar y transformar.',
      'La voz del usuario está presente de forma sistemática en la operación y el negocio.',
      'Los equipos pueden prototipar, aprender y escalar soluciones con disciplina.',
    ],
    nextMove: 'Escalar la capacidad como activo de TEXO y convertirla en oferta consultiva para clientes externos.',
  },
};

export function getDimensionInterpretation(dimension: DimensionKey, score: number) {
  const label = DIMENSION_LABELS[dimension];

  if (score < 2) {
    return `${label} hoy funciona de forma incipiente. La práctica existe poco, aparece de manera reactiva o depende de personas puntuales.`;
  }

  if (score < 3) {
    return `${label} muestra señales de desarrollo, pero todavía no se sostiene con consistencia. Conviene convertir las prácticas aisladas en rutinas visibles.`;
  }

  if (score < 4) {
    return `${label} ya está razonablemente instalada. Hay una base repetible, aunque todavía puede ganar medición, profundidad y alcance transversal.`;
  }

  return `${label} es una fortaleza del sistema. Puede usarse como palanca para acelerar otras dimensiones y para mostrar casos internos de referencia.`;
}

export function buildNarrativeFromScores(step: LadderStep, scores: DimensionScore) {
  const entries = DIMENSIONS.map((key) => [key, Number(scores?.[key] ?? 0)] as const);
  const weakest = [...entries].sort((a, b) => a[1] - b[1])[0];
  const strongest = [...entries].sort((a, b) => b[1] - a[1])[0];

  const weakLabel = DIMENSION_LABELS[weakest[0] as DimensionKey];
  const strongLabel = DIMENSION_LABELS[strongest[0] as DimensionKey];

  const opener = STEP_COPY[step].summary;
  return `${opener} En esta lectura, ${strongLabel.toLowerCase()} aparece como una capacidad relativamente más desarrollada, mientras que ${weakLabel.toLowerCase()} actúa como una de las brechas que más condiciona el salto al siguiente nivel.`;
}
