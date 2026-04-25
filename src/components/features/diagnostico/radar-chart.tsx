'use client';

import { useEffect, useRef } from 'react';
import type { Scores } from './resultado-data';

export function RadarChart({ scores }: { scores: Scores }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let chart: { destroy: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const Chart = (await import('chart.js/auto')).default;
      if (cancelled || !ref.current) return;

      chart = new Chart(ref.current, {
        type: 'radar',
        data: {
          labels: ['Posicionamento', 'Público', 'Produto', 'Programas', 'Processos', 'Pessoas'],
          datasets: [
            {
              label: 'Sua Pontuação',
              data: [
                scores.posicionamento,
                scores.publico,
                scores.produto,
                scores.programas,
                scores.processos,
                scores.pessoas,
              ],
              fill: true,
              backgroundColor: 'rgba(198, 255, 0, 0.2)',
              borderColor: 'rgb(198, 255, 0)',
              pointBackgroundColor: 'rgb(198, 255, 0)',
              pointBorderColor: '#F5F1E8',
              pointHoverBackgroundColor: '#F5F1E8',
              pointHoverBorderColor: 'rgb(198, 255, 0)',
              borderWidth: 3,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              beginAtZero: true,
              max: 4,
              ticks: {
                stepSize: 1,
                color: '#9ca3af',
                backdropColor: 'transparent',
                font: { size: 12 },
              },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              pointLabels: {
                color: '#ffffff',
                font: { size: 14, weight: 600 },
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              titleColor: '#ffffff',
              bodyColor: '#d1d5db',
              borderColor: 'rgb(198, 255, 0)',
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: (ctx: { parsed: { r: number } }) => `Nível: ${ctx.parsed.r}/4`,
              },
            },
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      chart?.destroy();
    };
  }, [scores]);

  return <canvas ref={ref} />;
}
