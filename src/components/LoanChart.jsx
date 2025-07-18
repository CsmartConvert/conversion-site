import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function LoanChart({ type, result }) {
  const chartRef = useRef(null);
  const previousLabelsRef = useRef([]);

  useEffect(() => {
    if (!result) return;

    const ctx = document.getElementById(`${type}-chart`);
    if (!ctx || !(ctx instanceof HTMLCanvasElement)) return;

    const labelsUnchanged = JSON.stringify(previousLabelsRef.current) === JSON.stringify(result.labels);
    if (chartRef.current && labelsUnchanged) return;

    if (chartRef.current) chartRef.current.destroy();

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: result.labels,
        datasets: [
          {
            label: 'Remaining Balance',
            data: result.balanceData,
            borderColor: '#3b82f6',
            fill: false
          },
          {
            label: 'Principal Paid',
            data: result.principalData,
            borderColor: '#10b981',
            fill: false
          },
          {
            label: 'Interest Paid',
            data: result.interestData,
            borderColor: '#f97316',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });

    chartRef.current = newChart;
    previousLabelsRef.current = result.labels;

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [result, type]);

  return (
    <div className="relative mb-6" role="region" aria-labelledby={`${type}-chart-label`}>
      {/* Visually hidden chart description */}
      <p id={`${type}-chart-label`} className="sr-only">
        Line chart showing loan trends over time for {type} loan. The chart includes remaining balance, interest paid,
        and principal paid per month.
      </p>

      <canvas
        id={`${type}-chart`}
        className="min-w-[600px] h-[260px] md:h-[300px]"
        role="presentation"
        aria-hidden="true"
      />
    </div>
  );
}
