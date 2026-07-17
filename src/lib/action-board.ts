import { ActionItem, ActionPhase, ActionStatus } from '@/lib/types';

export type ActionBoardStageId = 'todo' | 'doing' | 'validate' | 'done';

export type ActionBoardStage = {
  id: ActionBoardStageId;
  label: string;
  description: string;
  phase: ActionPhase;
  status: ActionStatus;
};

export const ACTION_BOARD_STAGES: ActionBoardStage[] = [
  {
    id: 'todo',
    label: 'Por hacer',
    description: 'Acciones priorizadas que todavía necesitan responsable o fecha.',
    phase: 'Priorizar',
    status: 'Pendiente',
  },
  {
    id: 'doing',
    label: 'En curso',
    description: 'Acciones que el equipo ya está implementando.',
    phase: 'Implementar',
    status: 'En curso',
  },
  {
    id: 'validate',
    label: 'Validar',
    description: 'Acciones ejecutadas que necesitan evidencia, aprendizaje o medición.',
    phase: 'Medir',
    status: 'En curso',
  },
  {
    id: 'done',
    label: 'Completada',
    description: 'Acciones cerradas con evidencia registrada.',
    phase: 'Escalar',
    status: 'Completada',
  },
];

export function getBoardStage(action: ActionItem): ActionBoardStageId {
  if (action.status === 'Completada' || action.phase === 'Escalar') return 'done';
  if (action.phase === 'Medir') return 'validate';
  if (action.status === 'En curso' || action.status === 'Bloqueada' || action.phase === 'Implementar') return 'doing';
  return 'todo';
}

export function getStagePatch(stageId: ActionBoardStageId): Pick<ActionItem, 'phase' | 'status'> {
  const stage = ACTION_BOARD_STAGES.find((item) => item.id === stageId) || ACTION_BOARD_STAGES[0];
  return { phase: stage.phase, status: stage.status };
}
