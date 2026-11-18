import { useState } from 'react';
import { sharedApi } from '../../api';
import CommentButton from '../../components/CommentButton';

// Zakaz qabul qilish va "Tugatish"
export default function OrdersCard({ date, orders, onChanged }) {
  const [form, setForm] = useState({ customerName: '', phone: '', quantity: '', note: '' });
  const [err, setErr] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await sharedApi.createOrder({ ...form, date });
      setForm({ customerName: '', phone: '', quantity: '', note: '' });
      onChanged();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const done = async (id) => {
    setErr('');
    try {
      await sharedApi.doneOrder(id);
      onChanged();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <section className="card">
      <h2>Zakazlar</h2>
      <form onSubmit={submit} className="grid2">
        <div>
          <label className="label">Mijoz ismi</label>
          <input className="input" value={form.customerName} onChange={set('customerName')} />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" value={form.phone} onChange={set('phone')} placeholder="+998 90 123 45 67" />
        </div>
        <div>
          <label className="label">Non soni</label>
          <input className="input" type="number" min="1" value={form.quantity} onChange={set('quantity')} placeholder="0" />
        </div>
        <div>
          <label className="label">Izoh</label>
          <input className="input" value={form.note} onChange={set('note')} placeholder="Ixtiyoriy" />
        </div>
        <div>
          <button className="btn btn-primary" type="submit">
            Zakaz qoshish
          </button>
        </div>
      </form>
      {err && <p className="form-error">{err}</p>}
      <ul className="list">
        {orders.map((o) => (
          <li key={o._id} className="list-item">
            <div>
              <strong>{o.customerName}</strong> · {o.phone}
              <div className="muted">
                {o.quantity} dona {o.note ? `· ${o.note}` : ''}
              </div>
              {o.isDone ? (
                <span className="badge badge-green">Tugatilgan</span>
              ) : (
                <span className="badge badge-red">Kutulyapti</span>
              )}
            </div>
            <div className="btn-row">
              {!o.isDone && (
                <button className="btn btn-sm btn-primary" onClick={() => done(o._id)}>
                  Tugatish
                </button>
              )}
              <CommentButton targetModel="Order" refId={o._id} />
            </div>
          </li>
        ))}
        {!orders.length && <li className="muted">Zakaz yoq</li>}
      </ul>
    </section>
  );
}
