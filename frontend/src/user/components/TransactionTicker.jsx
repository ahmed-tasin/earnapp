import React from "react";

import "../styles/transactionTicker.css";

const TICKER_SECONDS_PER_ITEM = 2;
// 0.7 = দ্রুত | 1.2 = স্বাভাবিক | 2 = ধীর

const demoTransactions = [
  { id: 1, phone: "017****4521", method: "bKash", amount: 1250 },
  { id: 2, phone: "018****7834", method: "Nagad", amount: 850 },
  { id: 3, phone: "019****2698", method: "Nagad", amount: 2100 },
  { id: 4, phone: "016****9157", method: "bKash", amount: 500 },
  { id: 5, phone: "013****6482", method: "Nagad", amount: 1750 },
  { id: 6, phone: "014****3276", method: "Nagad", amount: 950 },
  { id: 7, phone: "015****8043", method: "bKash", amount: 3200 },
  { id: 8, phone: "017****5369", method: "Nagad", amount: 1450 },
  { id: 9, phone: "018****1925", method: "Nagad", amount: 2800 },
  { id: 10, phone: "019****6714", method: "bKash", amount: 1100 },
  { id: 11, phone: "013****7428", method: "bKash", amount: 1500 },
  { id: 12, phone: "014****3851", method: "Nagad", amount: 2200 },
  { id: 13, phone: "015****9264", method: "bKash", amount: 750 },
  { id: 14, phone: "016****4178", method: "Nagad", amount: 4000 },
  { id: 15, phone: "017****6832", method: "bKash", amount: 1000 },
  { id: 16, phone: "018****2547", method: "Nagad", amount: 3000 },
  { id: 17, phone: "019****8365", method: "bKash", amount: 550 },
  { id: 18, phone: "013****1496", method: "Nagad", amount: 1250 },
  { id: 19, phone: "014****5723", method: "bKash", amount: 5000 },
  { id: 20, phone: "015****2689", method: "Nagad", amount: 1800 },
  { id: 21, phone: "016****7341", method: "bKash", amount: 2000 },
  { id: 22, phone: "017****4856", method: "Nagad", amount: 650 },
  { id: 23, phone: "018****9137", method: "bKash", amount: 2500 },
  { id: 24, phone: "019****3468", method: "Nagad", amount: 3500 },
  { id: 25, phone: "013****8254", method: "bKash", amount: 900 },
  { id: 26, phone: "014****6912", method: "Nagad", amount: 1500 },
  { id: 27, phone: "015****4387", method: "bKash", amount: 4500 },
  { id: 28, phone: "016****1573", method: "Nagad", amount: 1100 },
  { id: 29, phone: "017****7945", method: "bKash", amount: 6000 },
  { id: 30, phone: "018****3628", method: "Nagad", amount: 700 },
  { id: 31, phone: "019****5481", method: "bKash", amount: 3000 },
  { id: 32, phone: "013****9762", method: "Nagad", amount: 1300 },
  { id: 33, phone: "014****2145", method: "bKash", amount: 800 },
  { id: 34, phone: "015****6893", method: "Nagad", amount: 7500 },
  { id: 35, phone: "016****4539", method: "bKash", amount: 2200 },
  { id: 36, phone: "017****1286", method: "Nagad", amount: 950 },
  { id: 37, phone: "018****7652", method: "bKash", amount: 500 },
  { id: 38, phone: "019****3947", method: "Nagad", amount: 2000 },
  { id: 39, phone: "013****5874", method: "bKash", amount: 3200 },
  { id: 40, phone: "014****8631", method: "Nagad", amount: 1200 },
  { id: 41, phone: "015****2468", method: "bKash", amount: 5500 },
  { id: 42, phone: "016****7195", method: "Nagad", amount: 1500 },
  { id: 43, phone: "017****3542", method: "bKash", amount: 10000 },
  { id: 44, phone: "018****6827", method: "Nagad", amount: 2500 },
  { id: 45, phone: "019****1359", method: "bKash", amount: 850 },
  { id: 46, phone: "013****4682", method: "Nagad", amount: 4000 },
  { id: 47, phone: "014****7953", method: "bKash", amount: 1750 },
  { id: 48, phone: "015****3217", method: "Nagad", amount: 5000 },
  { id: 49, phone: "016****8546", method: "bKash", amount: 2300 },
  { id: 50, phone: "017****6198", method: "Nagad", amount: 1000 },
];

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-BD");

function TickerGroup({ transactions, duplicate = false }) {
  return (
    <div
      className="transaction-ticker-group"
      aria-hidden={duplicate ? true : undefined}
    >
      {transactions.map((transaction) => (
        <span
          className="transaction-ticker-item"
          key={`${duplicate ? "copy" : "main"}-${transaction.id}`}
        >
          <span className="transaction-ticker-check">✓</span>
          <b>{transaction.phone}</b>
          <span> withdrew </span>
          <strong>৳{formatAmount(transaction.amount)}</strong>
          <span> via {transaction.method}</span>
          <i>•</i>
        </span>
      ))}
    </div>
  );
}

function TransactionTicker({
  transactions = demoTransactions,
  secondsPerItem = TICKER_SECONDS_PER_ITEM,
}) {
  const tickerData =
    Array.isArray(transactions) && transactions.length > 0
      ? transactions
      : demoTransactions;

  const tickerDuration = Math.max(
    tickerData.length * Number(secondsPerItem || 1.2),
    20
  );

  return (
    <section
      className="transaction-ticker"
      aria-label="Demo transaction announcements"
    >
      <span className="transaction-ticker-live">Live</span>

      <div className="transaction-ticker-window">
        <div
          className="transaction-ticker-track"
          style={{ "--ticker-duration": `${tickerDuration}s` }}
        >
          <TickerGroup transactions={tickerData} />
          <TickerGroup transactions={tickerData} duplicate />
        </div>
      </div>
    </section>
  );
}

export { demoTransactions };
export default TransactionTicker;