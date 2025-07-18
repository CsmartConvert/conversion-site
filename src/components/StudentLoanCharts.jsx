import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function StudentLoanCharts({ labels, balances, interests, principals, principalTotal, interestTotal }) {
  const balanceChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const balanceCtx = document.getElementById('balanceChart');
    const pieCtx = document.getElementById('pieChart');

    if (balanceCtx) {
      if (balanceChartRef.current) {
        balanceChartRef.current.data.labels = labels;
        balanceChartRef.current.data.datasets[0].data = balances;
        balanceChartRef.current.data.datasets[1].data = principals;
        balanceChartRef.current.data.datasets[2].data = interests;
        balanceChartRef.current.update();
      } else {
        balanceChartRef.current = new Chart(balanceCtx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: "Remaining Balance",
                data: balances,
                borderColor: "#3b82f6",
                tension: 0.3,
                fill: false
              },
              {
                label: "Principal Paid",
                data: principals,
                borderColor: "#10b981",
                tension: 0.3,
                fill: false
              },
              {
                label: "Interest Paid",
                data: interests,
                borderColor: "#f97316",
                tension: 0.3,
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
      }
    }

    if (pieCtx) {
      if (pieChartRef.current) {
        pieChartRef.current.data.datasets[0].data = [Number(principalTotal), Number(interestTotal)];
        pieChartRef.current.update();
      } else {
        pieChartRef.current = new Chart(pieCtx, {
          type: 'pie',
          data: {
            labels: ["Principal", "Interest"],
            datasets: [{
              data: [Number(principalTotal), Number(interestTotal)],
              backgroundColor: ["#3b82f6", "#f97316"]
            }]
          }
        });
      }
    }
  }, [labels, balances, interests, principals, principalTotal, interestTotal]);

  // ✅ THIS IS THE MISSING PIECE
  return (
    <div className="w-full">
      <div className="mb-8" style={{ height: "400px" }}>
        <canvas id="balanceChart"></canvas>
      </div>
      <div className="mb-12 max-w-md mx-auto" style={{ height: "400px" }}>
        <canvas id="pieChart"></canvas>
      </div>
    </div>
  );
}



