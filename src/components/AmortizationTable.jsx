import React from 'react';

export default function AmortizationTable({ result, amortizationData, type, downloadCSV }) {
  if (!result || amortizationData.length === 0) return null;

  const [showTable, setShowTable] = React.useState(false);

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

  return (
    <div className="mt-6 bg-white border border-gray-300 rounded shadow-sm">
      <div aria-live="polite" className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">💡 Result Summary</h2>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded mb-6 text-sm">
          <p>📅 Monthly Payment: <strong>{currency.format(result.monthly)}</strong></p>
          <p>💵 Total Interest: <strong>{currency.format(result.totalInterest)}</strong></p>
          <p>💰 Total Cost: <strong>{currency.format(result.totalCost)}</strong></p>
        </div>

        <div className="mb-6">
          <canvas id={`loanChart-${type}`} className="w-full h-64 mb-6" role="img" aria-label="Loan payment trend line chart"></canvas>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-gray-700">📊 Amortization Schedule</h3>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => setShowTable(!showTable)}
            >
              {showTable ? 'Hide Table' : 'Show Table'}
            </button>
            <button
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={downloadCSV}
            >
              Download CSV
            </button>
          </div>
        </div>

        {showTable && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border">Month</th>
                  <th className="px-3 py-2 border">Payment</th>
                  <th className="px-3 py-2 border">Principal</th>
                  <th className="px-3 py-2 border">Interest</th>
                  <th className="px-3 py-2 border">Balance</th>
                </tr>
              </thead>
              <tbody>
                {amortizationData.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-3 py-2 border">{item.month}</td>
                    <td className="px-3 py-2 border">{currency.format(item.payment)}</td>
                    <td className="px-3 py-2 border">{currency.format(item.principal)}</td>
                    <td className="px-3 py-2 border">{currency.format(item.interest)}</td>
                    <td className="px-3 py-2 border">{currency.format(item.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-800 mb-2">📌 Why This Matters</h4>
          <p className="text-sm text-gray-700 mb-4">
            Understanding your amortization schedule helps you track how much you're paying toward principal vs. interest over time. This insight empowers better loan decisions and can save thousands in interest.
          </p>

          <h4 className="text-md font-semibold text-gray-800 mb-2">✅ Pro Tips</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Make extra payments toward principal early to reduce interest.</li>
            <li>Refinance if your interest rate is significantly above market average.</li>
            <li>Review the total cost — not just monthly payment — when comparing loans.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


