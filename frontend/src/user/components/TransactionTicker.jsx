import React from "react";

import "../styles/transactionTicker.css";

const demoTransactions = [
  {
    id: 1,
    phone: "017****4521",
    method: "bKash",
    amount: 1250,
  },
  {
    id: 2,
    phone: "018****7834",
    method: "Nagad",
    amount: 850,
  },
  {
    id: 3,
    phone: "019****2698",
    method: "Rocket",
    amount: 2100,
  },
  {
    id: 4,
    phone: "016****9157",
    method: "bKash",
    amount: 500,
  },
  {
    id: 5,
    phone: "013****6482",
    method: "Nagad",
    amount: 1750,
  },
  {
    id: 6,
    phone: "014****3276",
    method: "Rocket",
    amount: 950,
  },
  {
    id: 7,
    phone: "015****8043",
    method: "bKash",
    amount: 3200,
  },
  {
    id: 8,
    phone: "017****5369",
    method: "Nagad",
    amount: 1450,
  },
  {
    id: 9,
    phone: "018****1925",
    method: "Rocket",
    amount: 2800,
  },
  {
    id: 10,
    phone: "019****6714",
    method: "bKash",
    amount: 1100,
  },
];

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-BD");

function TickerGroup({ transactions, duplicate = false }) {
  return (
    <div
      className="transaction-ticker-group"
      aria-hidden={duplicate ? "true" : undefined}
    >
      {transactions.map((transaction) => (
        <div
          className="transaction-ticker-item"
          key={`${duplicate ? "copy" : "main"}-${transaction.id}`}
        >
          <span className="transaction-ticker-check">✓</span>

          <span className="transaction-ticker-phone">
            {transaction.phone}
          </span>

          <span>withdrew</span>

          <strong>৳{formatAmount(transaction.amount)}</strong>

          <span>via {transaction.method}</span>
        </div>
      ))}
    </div>
  );
}

function TransactionTicker({ transactions = demoTransactions }) {
  const tickerData =
    Array.isArray(transactions) && transactions.length > 0
      ? transactions
      : demoTransactions;

  return (
    <section
      className="transaction-ticker"
      aria-label="Demo transaction announcements"
    >
      <div className="transaction-ticker-label">
        <span className="transaction-ticker-pulse" />
        <strong>Transactions</strong>
        <small></small>
      </div>

      <div className="transaction-ticker-window">
        <div className="transaction-ticker-track">
          <TickerGroup transactions={tickerData} />
          <TickerGroup transactions={tickerData} duplicate />
        </div>
      </div>
    </section>
  );
}

export { demoTransactions };
export default TransactionTicker;
