import { useEffect, useState } from 'react';
import { driverApi } from '../../api';
import CommentButton from '../../components/CommentButton';
import { money } from '../../utils/date';

// Do'konlarga tarqatish: qoldiqdan kop bolmasin (serverda tekshiriladi)
export default function DeliverCard({ date, data, disabled = false, onSaved }) {
  const [form, setForm] = useState({ bakeryId: '', shopId: '', quantity: '', cash: '', click: '' });
  const [err, setErr] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Do'kon narxi boyicha naqd pulni avtomatik hisoblash
  useEffect(() => {
    const shop = data.shops.find((s) => s._id === form.shopId);
    const qty = parseInt(form.quantity, 10);
    if (shop && qty > 0) {
      setForm((f) => ({ ...f, cash: String(qty * shop.price) }));
    }
  }, [form.shopId, form.quantity, data.shops]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await driverApi.addDelivery({ ...form, date });
      setForm({ bakeryId: '', shopId: '', quantity: '', cash: '', click: '' });
      onSaved();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const selectedLeftover = data.leftovers.find((l) => String(l.bakery) === form.bakeryId);

  return (
    <section className="card">
      <h2>Do'konlarga tarqatish</h2>
      <form onSubmit={submit} className="grid2">
        <div>
          <label className="label">Nonyovxona</label>
          <select className="input" value={form.bakeryId} onChange={set('bakeryId')} disabled={disabled}>
            <option value="">Tanlang...</option>
            {data.leftovers.map((l) => (
              <option key={l.bakery} value={l.bakery}>
                {l.name} (qoldiq: {l.leftover})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Do'kon</label>
          <select className="input" value={form.shopId} onChange={set('shopId')} disabled={disabled}>
            <option value="">Tanlang...</option>
            {data.shops.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} — {money(s.price)} so'm
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Non soni</label>
          <input className="input" type="number" min="1" disabled={disabled} value={form.quantity} onChange={set('quantity')} placeholder="0" />
        </div>
        <div>
          <label className="label">Naqd pul (so'm)</label>
          <input className="input" type="number" min="0" disabled={disabled} value={form.cash} onChange={set('cash')} placeholder="0" />
        </div>
        <div>
          <label className="label">Click (so'm)</label>
          <input className="input" type="number" min="0" disabled={disabled} value={form.click} onChange={set('click')} placeholder="0" />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={disabled}>
            Tarqatish
          </button>
        </div>
      </form>
      {selectedLeftover && (
        <p className="muted">
          {selectedLeftover.name} qoldigi: <b>{selectedLeftover.leftover}</b> dona
        </p>
      )}
      {err && <p className="form-error">{err}</p>}
      <ul className="list">
        {data.deliveries.map((d) => (
          <li key={d._id} className="list-item">
            <div>
              <strong>{d.shop?.name}</strong>
              <div className="muted">
                {d.bakery?.name} · {d.quantity} dona
              </div>
              <div className="muted">
                Naqd: {money(d.cash)} · Click: {money(d.click)} so'm
              </div>
            </div>
            <CommentButton targetModel="Delivery" refId={d._id} />
          </li>
        ))}
        {!data.deliveries.length && <li className="muted">Bugun tarqatilmagan</li>}
      </ul>
    </section>
  );
}
