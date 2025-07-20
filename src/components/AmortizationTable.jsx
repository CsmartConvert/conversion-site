import React from 'react';

export default function AmortizationTable({ result, amortizationData, type, downloadCSV, currencyFormatter }) {
  if (!result || amortizationData.length === 0) return null;

  return (
    <>
      <div className="text-right mb-3">
        <button
          onClick={downloadCSV}
          className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300"
        >
          ⬇️ Download Amortization CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600 max-w-full">
        <table
          className="min-w-full text-sm text-gray-800 dark:text-gray-200 border-collapse bg-white dark:bg-gray-900"
          id={`table-${type}`}
        >
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 font-semibold">
            <tr>
              <th className="py-2 px-3 text-left border-b">Month</th>
              <th className="py-2 px-3 text-left border-b">Interest</th>
              <th className="py-2 px-3 text-left border-b">Principal</th>
              <th className="py-2 px-3 text-left border-b">Payment</th>
              <th className="py-2 px-3 text-left border-b">Remaining Balance</th>
            </tr>
          </thead>
          <tbody>
            {amortizationData.map((row, i) => (
              <tr key={row.month} className="border-b dark:border-gray-700">
                <td className="py-1.5 px-3 border-b">{row.month}</td>
                <td className="py-1.5 px-3 border-b">{currencyFormatter.format(row.interest)}</td>
                <td className="py-1.5 px-3 border-b">{currencyFormatter.format(row.principal)}</td>
                <td className="py-1.5 px-3 border-b">{currencyFormatter.format(row.payment)}</td>
                <td className="py-1.5 px-3 border-b">{currencyFormatter.format(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}


