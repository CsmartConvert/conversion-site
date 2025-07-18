{result && (
  <div aria-live="polite">
    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded mb-6 text-sm">
      <p>📅 Monthly Payment: <strong>${result.monthly}</strong></p>
      <p>💵 Total Interest: <strong>${result.totalInterest}</strong></p>
      <p>💰 Total Cost: <strong>${result.totalCost}</strong></p>
    </div>

    <canvas id={`${type}-chart`} className="w-full h-64 mb-6" role="img" aria-label="Loan payment trend line chart"></canvas>

   <div className="text-right mb-3">
  <button
    onClick={downloadCSV}
    className="text-blue-600 underline text-xs sm:text-sm hover:text-blue-800"
  >
    ⬇️ Download Amortization CSV
  </button>
</div>


    <div className="overflow-x-auto rounded-lg shadow border border-gray-300 max-w-full sm:overflow-scroll">

      <table className="min-w-full text-sm border-collapse bg-white" role="table">
        <thead className="bg-gray-100 text-gray-800 font-semibold">
          <tr role="row">
            <th className="py-2 px-3 text-left border-b">Month</th>
            <th className="py-2 px-3 text-left border-b">Interest</th>
            <th className="py-2 px-3 text-left border-b">Principal</th>
            <th className="py-2 px-3 text-left border-b">Payment</th>
            <th className="py-2 px-3 text-left border-b">Remaining Balance</th>
          </tr>
        </thead>
        <tbody>
          {amortizationData.map((row, i) => (
            <tr
              key={row.month}
              className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              role="row"
            >
              <td className="py-1.5 px-3 border-b">${row.month}</td>
              <td className="py-1.5 px-3 border-b">${row.interest}</td>
              <td className="py-1.5 px-3 border-b">${row.principal}</td>
              <td className="py-1.5 px-3 border-b">${row.payment}</td>
              <td className="py-1.5 px-3 border-b">${row.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
