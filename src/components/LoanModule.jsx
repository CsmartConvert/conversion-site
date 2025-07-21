import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function LoanModule({ type }) {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const [balloon, setBalloon] = useState('');
  const [result, setResult] = useState(null);
  const [amortizationData, setAmortizationData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [chartRef, setChartRef] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [chartType, setChartType] = useState('line');
  const canvasRef = useRef(null);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    if (result && canvasRef.current) {
      if (chartRef) {
        chartRef.destroy();
      }
      const ctx = canvasRef.current.getContext('2d');
      const newChart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: amortizationData.map((_, i) => `Month ${i + 1}`),
          datasets: [
            {
              label: 'Principal Paid',
              data: amortizationData.map((d) => d.principal),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false,
            },
            {
              label: 'Interest Paid',
              data: amortizationData.map((d) => d.interest),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });
      setChartRef(newChart);
    }
  }, [result, chartType]);

  const calculateLoan = (e) => {
    e.preventDefault();

    const P = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseInt(term);
    const B = parseFloat(balloon) || 0;

    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r <= 0 || n <= 0) {
      alert('Please enter valid loan details.');
      return;
    }

    let monthlyPayment = 0;
    let totalInterest = 0;
    let schedule = [];

    if (type === 'amortized') {
      monthlyPayment = (P * r) / (1 - Math.pow(1 + r, -n));
      let balance = P;

      for (let i = 0; i < n; i++) {
        const interest = balance * r;
        const principal = monthlyPayment - interest;
        balance -= principal;
        schedule.push({
          month: i + 1,
          interest,
          principal,
          payment: monthlyPayment,
          balance: Math.max(balance, 0),
        });
      }
      totalInterest = schedule.reduce((sum, p) => sum + p.interest, 0);
    } else if (type === 'interest-only') {
      const interestPayment = P * r;
      monthlyPayment = interestPayment;
      totalInterest = interestPayment * n;

      for (let i = 0; i < n; i++) {
        schedule.push({
          month: i + 1,
          interest: interestPayment,
          principal: 0,
          payment: monthlyPayment,
          balance: P,
        });
      }
    } else if (type === 'deferred') {
      totalInterest = P * r * (n / 12);
      monthlyPayment = 0;

      for (let i = 0; i < n; i++) {
        schedule.push({
          month: i + 1,
          interest: 0,
          principal: 0,
          payment: 0,
          balance: P,
        });
      }
    } else if (type === 'balloon') {
      monthlyPayment = (P * r) / (1 - Math.pow(1 + r, -n));
      let balance = P;

      for (let i = 0; i < n; i++) {
        const interest = balance * r;
        const principal = monthlyPayment - interest;
        balance -= principal;
        schedule.push({
          month: i + 1,
          interest,
          principal,
          payment: monthlyPayment,
          balance: Math.max(balance, 0),
        });
      }
      totalInterest = schedule.reduce((sum, p) => sum + p.interest, 0);
    }

    setResult({
      monthlyPayment,
      totalInterest,
      totalCost: P + totalInterest,
    });

    setAmortizationData(schedule);
  };

  const downloadCSV = () => {
    if (!amortizationData.length) return;
    const header = ['Month', 'Interest', 'Principal', 'Payment', 'Remaining'];
    const rows = amortizationData.map((row, i) => [
      i + 1,
      row.interest.toFixed(2),
      row.principal.toFixed(2),
      row.payment?.toFixed(2) ?? (row.interest + row.principal).toFixed(2),
      row.balance?.toFixed(2) ?? '',
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amortization_schedule.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="max-w-4xl mx-auto my-10 bg-white p-6 shadow-md rounded-md">
      <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
      <h2 className="text-xl font-bold mb-4 capitalize">{type.replace('-', ' ')} Loan</h2>
      <form onSubmit={calculateLoan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Annual Interest Rate (%)</label>
          <input
            id="rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="term" className="block text-sm font-medium text-gray-700">Term (months)</label>
          <input
            id="term"
            type="number"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            required
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        {type === 'balloon' && (
          <div>
            <label htmlFor="balloon" className="block text-sm font-medium text-gray-700">Balloon Payment</label>
            <input
              id="balloon"
              type="number"
              value={balloon}
              onChange={(e) => setBalloon(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
        )}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
        <div>
          <label htmlFor="chartType" className="block text-sm font-medium text-gray-700">Chart Type</label>
          <select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Calculate
          </button>
        </div>
      </form>

      {result && (
        <div id="main" className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Monthly Payment</p>
              <p className="text-lg font-bold">{formatter.format(result.monthlyPayment)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Total Interest</p>
              <p className="text-lg font-bold">{formatter.format(result.totalInterest)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-lg font-bold">{formatter.format(result.totalCost)}</p>
            </div>
          </div>
          <div className="relative">
            <canvas ref={canvasRef} className="w-full min-h-[280px]" aria-label="Loan Chart"></canvas>
          </div>
          <button
            onClick={() => setShowTable((prev) => !prev)}
            className="mt-4 text-blue-600 underline"
            aria-expanded={showTable}
            aria-controls="amortization-table"
          >
            {showTable ? 'Hide Amortization Schedule' : 'Show Amortization Schedule'}
          </button>
          {showTable && (
            <>
              <div className="text-right mt-4 mb-2">
                <button
                  onClick={downloadCSV}
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  ⬇️ Download Amortization CSV
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table
                  id="amortization-table"
                  className="min-w-full bg-white text-sm text-gray-800 border-collapse"
                >
                  <thead className="bg-gray-100 text-gray-900 font-semibold">
                    <tr>
                      <th className="py-2 px-4 border">Month</th>
                      <th className="py-2 px-4 border">Interest</th>
                      <th className="py-2 px-4 border">Principal</th>
                      <th className="py-2 px-4 border">Payment</th>
                      <th className="py-2 px-4 border">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationData.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="py-1 px-4 border">{row.month}</td>
                        <td className="py-1 px-4 border">{formatter.format(row.interest)}</td>
                        <td className="py-1 px-4 border">{formatter.format(row.principal)}</td>
                        <td className="py-1 px-4 border">{formatter.format(row.payment)}</td>
                        <td className="py-1 px-4 border">{formatter.format(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="mt-6 bg-gray-50 border-l-4 border-blue-400 p-4">
            <h3 className="font-semibold text-blue-700 mb-2">Why This Matters</h3>
            <p className="text-sm text-gray-700">
              Understanding your loan breakdown helps you make informed decisions. This tool shows how your
              payment is split between principal and interest over time.
            </p>
          </div>

          <div className="mt-4 bg-blue-50 border-l-4 border-blue-300 p-4">
            <h3 className="font-semibold text-blue-700 mb-2">Pro Tips</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Compare different loan types to see their long-term impact.</li>
              <li>Use the CSV export to share or track your amortization plan.</li>
              <li>Even small extra payments early on reduce your total interest significantly.</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

LoanModule