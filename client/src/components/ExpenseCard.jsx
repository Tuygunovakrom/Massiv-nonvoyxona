import { useState } from 'react';
import { sharedApi } from '../api';
import CommentButton from './CommentButton';
import { money } from '../utils/date';

// Rasxod: summa va nimaga ketgani (nonyov va shofyor uchun umumiy)
export default function ExpenseCard({ date, expenses, disabled = false, onSaved }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  const add = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await sharedApi.addExpense({ date, amount, reason });
      setAmount('');
      setReason('');
      onSaved();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <section className="card">
      <h2>Rasxod</h2>
      <form onSubmit={add} className="grid2">
        <div>
          <label className="label">Summa (so'm)</label>
          <input
            className="input"
            type="number"
            min="1"
            disabled={disabled}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="label">Nimaga ketdi</label>
          <input
            className="input"
            disabled={disabled}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Masalan: yonilgi"
          />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={disabled}>
            Qoshish
          </button>
        </div>
      </form>
      {err && <p className="form-error">{err}</p>}
      <ul className="list">
        {expenses.map((x) => (
          <li key={x._id} className="list-item">
            <div>
              <strong>{money(x.amount)} so'm</strong>
              <div className="muted">{x.reason}</div>
            </div>
            <CommentButton targetModel="Expense" refId={x._id} />
          </li>
        ))}
        {!expenses.length && <li className="muted">Rasxod yoq</li>}
      </ul>
    </section>
  );
}
