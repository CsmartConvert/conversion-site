// Due to message size limitations, the full script will be split into parts.
// This is Part 1 of 2

import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

export default function LoanModule({ type }) {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const [balloon, setBalloon] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [result, setResult] = useState(null);
  const [amortizationData, setAmortizationData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const loanLabels = {
    amortized: 'Amortized Loan',
    'interest-only': 'Interest-Only Loan',
    deferred: 'Deferred Payment Loan',
    balloon: 'Balloon Loan',
  };

  function calculateLoan(e) {
    e.preventDefault();
    const P = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseInt(term);
    const B = parseFloat(balloon) || 0;

    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r < 0 || n <= 0) return;

    let monthly = 0,
      totalInterest = 0,
      remaining = P;
    let balanceData = [],
      interestData = [],
      principalData = [],
      labels = [],
      amortization = [];

    switch (type) {
      case 'amortized':
        monthly = (P * r) / (1 - Math.pow(1 + r, -n));
        break;
      case 'interest-only':
        monthly = P * r;
        break;
      case 'deferred':
        monthly = 0;
        break;
      case 'balloon':
        monthly = (P * r) / (1 - Math.pow(1 + r, -(n - 1)));
        break;
    }

    for (let i = 1; i <= n; i++) {
      let interest = remaining * r;
      let principalPaid = 0;
      let actualPayment = monthly;

      switch (type) {
        case 'amortized':
          principalPaid = monthly - interest;
          break;
        case 'interest-only':
          principalPaid = i === n ? P : 0;
          break;
        case 'deferred':
          interest = 0;
          principalPaid = i === n ? P : 0;
          break;
        case 'balloon':
          if (i === n) {
            principalPaid = remaining;
            interest = remaining * r;
            actualPayment += B;
          } else {
            principalPaid = monthly - interest;
          }
          break;
      }

      remaining -= principalPaid;
      totalInterest += interest;

      labels.push(`Month ${i}`);
      balanceData.push(Math.max(remaining, 0).toFixed(2));
      interestData.push(interest.toFixed(2));
      principalData.push(principalPaid.toFixed(2));
      amortization.push({
        month: i,
        interest: interest.toFixed(2),
        principal: principalPaid.toFixed(2),
        payment: actualPayment.toFixed(2),
        balance: Math.max(remaining, 0).toFixed(2),
      });
    }

    setResult({
      monthly: monthly.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalCost: (P + totalInterest).toFixed(2),
      balanceData,
      interestData,
      principalData,
      labels,
    });

    setAmortizationData(amortization);
    setShowTable(true);
  }

  useEffect(() => {
    if (!result) return;

    const chartId = `${type}-chart`;
    const ctx = document.getElementById(chartId);
    if (ctx && ctx instanceof HTMLCanvasElement) {
      if (chartRef) chartRef.destroy();

      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: result.labels,
          datasets: [
            {
              label: 'Remaining Balance',
              data: result.balanceData,
              borderColor: '#3b82f6',
              fill: false,
            },
            {
              label: 'Principal Paid',
              data: result.principalData,
              borderColor: '#10b981',
              fill: false,
            },
            {
              label: 'Interest Paid',
              data: result.interestData,
              borderColor: '#f97316',
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'top' } },
        },
      });

      setChartRef(newChart);
    }
  }, [result]);

  function downloadCSV() {
    const headers = 'Month,Interest,Principal,Payment,Remaining Balance\n';
    const rows = amortizationData.map(
      (row) =>
        `${row.month},${row.interest},${row.principal},${row.payment},${row.balance}`
    );
    const blob = new Blob([headers + rows.join('\n')], {
      type: 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amortization_schedule.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 mb-12">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{loanLabels[type]}</h2>

      <form
        onSubmit={calculateLoan}
        className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        aria-label={`${loanLabels[type]} Form`}
      >
        <div>
          <label htmlFor={`${type}-amount`} className="block text-sm font-medium text-gray-700">
            Loan Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            required
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor={`${type}-rate`} className="block text-sm font-medium text-gray-700">
            Annual Interest Rate (%)
          </label>
          <input
            id="rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            required
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor={`${type}-term`} className="block text-sm font-medium text-gray-700">
            Term (Months)
          </label>
          <input
            id="term"
            type="number"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            required
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        {type === 'balloon' && (
          <div>
            <label htmlFor={`${type}-balloon`} className="block text-sm font-medium text-gray-700">
              Balloon Payment ($)
            </label>
            <input
              id="balloon"
              type="number"
              value={balloon}
              onChange={(e) => setBalloon(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              required
            />
          </div>
        )}
        <div className="md:col-span-2">
          <button type="submit" className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Calculate
          </button>
        </div>
      </form>

      {result && (
        <div aria-live="polite">
          {/* Results Summary */}
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded mb-6 text-sm" role="region">
            <div className="flex justify-between mb-1">
              <span className="font-medium">📅 Monthly Payment</span>
              <span className="font-bold">{currency.format(result.monthly)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">💵 Total Interest</span>
              <span className="font-bold">{currency.format(result.totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">💰 Total Cost</span>
              <span className="font-bold">{currency.format(result.totalCost)}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="relative mb-6">
            <canvas
              id={`${type}-chart`}
              className="w-full min-h-[220px] md:min-h-[300px] border border-gray-200 rounded"
            ></canvas>
          </div>

          {/* Show/Hide Table */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-2 mb-4 text-blue-600 underline hover:text-blue-800 text-base"
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
                  className="text-blue-600 underline text-sm hover:text-blue-800"
                >
                  ⬇️ Download Amortization CSV
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 max-w-full">
                <table
                  className="min-w-full text-sm text-gray-800 border-collapse bg-white"
                  id={`table-${type}`}
                >
                  <thead className="bg-gray-100 text-gray-800 font-semibold">
                    <tr>
                      <th className="py-2 px-4 border">Month</th>
                      <th className="py-2 px-4 border">Interest</th>
                      <th className="py-2 px-4 border">Principal</th>
                      <th className="py-2 px-4 border">Payment</th>
                      <th className="py-2 px-4 border">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationData.map((row) => (
                      <tr key={row.month} className="border-b">
                        <td className="py-1.5 px-3 border-b">{row.month}</td>
                        <td className="py-1.5 px-3 border-b">{currency.format(row.interest)}</td>
                        <td className="py-1.5 px-3 border-b">{currency.format(row.principal)}</td>
                        <td className="py-1.5 px-3 border-b">{currency.format(row.payment)}</td>
                        <td className="py-1.5 px-3 border-b">{currency.format(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Why This Matters */}
          <div className="mt-6 bg-gray-50 border-l-4 border-blue-400 p-4">
            <h3 className="font-semibold text-blue-700 mb-2">Why This Matters</h3>
            <p className="text-sm text-gray-700">
              Understanding your loan breakdown helps avoid surprises and allows better financial planning. This calculator shows you not just your payment, but where the money goes.
            </p>
          </div>

          {/* Pro Tips */}
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-300 p-4">
            <h3 className="font-semibold text-blue-700 mb-2">Pro Tips</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Try different loan types to see how interest accumulates.</li>
              <li>Paying just a bit extra monthly can significantly reduce total interest.</li>
              <li>Use the CSV to track or share your amortization schedule.</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
// → Part 2 (Remaining JSX output with chart toggle, currency dropdown, results, table, etc.) coming next


LoanModule