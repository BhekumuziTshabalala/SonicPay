import React from 'react'

export default function TransactionTable({ transactions }) {
  return (
    <table className="min-w-full border border-gray-200 rounded overflow-hidden text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border-b">Timestamp</th>
          <th className="p-2 border-b">Customer/Merchant</th>
          <th className="p-2 border-b">Amount</th>
          <th className="p-2 border-b">Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, i) => (
          <tr key={i} className="even:bg-gray-50">
            <td className="p-2 border-b">{new Date(tx.timestamp).toLocaleString()}</td>
            <td className="p-2 border-b">{tx.party}</td>
            <td className="p-2 border-b">{tx.amount}</td>
            <td className="p-2 border-b">{tx.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
