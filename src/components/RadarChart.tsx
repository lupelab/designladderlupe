'use client';

import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { DIMENSIONS, DIMENSION_LABELS } from '@/lib/questionnaire';
import { DimensionScore, LadderStep } from '@/lib/types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const TARGET_BY_STEP: Record<LadderStep, DimensionScore> = {
  1: { strategy: 2.2, process: 2.3, research: 2.0, craft: 2.4, operations: 2.1 },
  2: { strategy: 3.1, process: 3.2, research: 2.8, craft: 3.2, operations: 2.9 },
  3: { strategy: 4.1, process: 4.0, research: 3.7, craft: 3.9, operations: 3.8 },
  4: { strategy: 4.6, process: 4.4, research: 4.2, craft: 4.3, operations: 4.3 },
};

export function RadarChart({
  scores,
  ladderStep,
  benchmarkScores,
}: {
  scores: DimensionScore;
  ladderStep: LadderStep;
  benchmarkScores?: DimensionScore;
}) {
  const labels = DIMENSIONS.map((dimension) => DIMENSION_LABELS[dimension]);
  const target = TARGET_BY_STEP[Math.min(ladderStep + 1, 4) as LadderStep];

  const datasets = [
    {
      label: 'Tu agencia hoy',
      data: DIMENSIONS.map((dimension) => scores[dimension]),
      borderColor: '#111111',
      backgroundColor: 'rgba(17,17,17,0.08)',
      borderWidth: 2,
      pointBackgroundColor: '#111111',
      pointBorderColor: '#111111',
      pointRadius: 3,
    },
    {
      label: 'Referencia siguiente nivel',
      data: DIMENSIONS.map((dimension) => target[dimension]),
      borderColor: '#BDBDBD',
      backgroundColor: 'rgba(189,189,189,0.06)',
      borderWidth: 1.5,
      pointBackgroundColor: '#BDBDBD',
      pointBorderColor: '#BDBDBD',
      pointRadius: 2,
    },
  ] as any[];

  if (benchmarkScores) {
    datasets.push({
      label: 'Promedio TEXO',
      data: DIMENSIONS.map((dimension) => benchmarkScores[dimension]),
      borderColor: '#5B5BD6',
      backgroundColor: 'rgba(91,91,214,0.05)',
      borderWidth: 1.5,
      pointBackgroundColor: '#5B5BD6',
      pointBorderColor: '#5B5BD6',
      pointRadius: 2,
    });
  }

  return (
    <div className="radar-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Mapa de capacidades</p>
          <h3>Lectura visual por dimensión</h3>
          <p className="muted">Compará la forma actual de tu agencia con la referencia del siguiente peldaño y con la base de TEXO.</p>
        </div>
      </div>

      <div className="radar-wrap">
        <Radar
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#4B5563',
                  boxWidth: 18,
                  boxHeight: 18,
                  useBorderRadius: true,
                  borderRadius: 4,
                  padding: 20,
                  font: { size: 12, family: 'Inter, sans-serif' },
                },
              },
              tooltip: {
                backgroundColor: '#111111',
                titleColor: '#FFFFFF',
                bodyColor: '#FFFFFF',
                padding: 12,
                displayColors: false,
              },
            },
            scales: {
              r: {
                min: 0,
                max: 5,
                ticks: {
                  stepSize: 1,
                  backdropColor: 'transparent',
                  color: '#9CA3AF',
                  font: { size: 11 },
                },
                grid: {
                  color: 'rgba(17,17,17,0.08)',
                },
                angleLines: {
                  color: 'rgba(17,17,17,0.08)',
                },
                pointLabels: {
                  color: '#111111',
                  font: {
                    size: 12,
                    family: 'Inter, sans-serif',
                    weight: 600,
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
