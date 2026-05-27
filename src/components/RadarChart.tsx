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
  1: { visionary: 2.2, inspirational: 2.1, relational: 2.0, identity: 2.2, adoption: 2.1, innovation: 2.2 },
  2: { visionary: 3.1, inspirational: 3.0, relational: 2.9, identity: 3.1, adoption: 3.0, innovation: 3.1 },
  3: { visionary: 4.0, inspirational: 3.8, relational: 3.7, identity: 3.9, adoption: 3.8, innovation: 4.0 },
  4: { visionary: 4.5, inspirational: 4.4, relational: 4.2, identity: 4.4, adoption: 4.3, innovation: 4.5 },
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
          <p className="eyebrow">Mapa de cultura de innovación</p>
          <h3>Lectura visual por bloque</h3>
          <p className="muted">Compará la cultura actual de innovación de tu agencia con la referencia del siguiente peldaño y con la base TEXO.</p>
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
