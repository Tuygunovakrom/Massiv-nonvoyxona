import { useState } from 'react';
import { bakerApi } from '../../api';
import CommentButton from '../../components/CommentButton';

// Shofyorga non berish (qoldiqdan kop bolmasin - serverda tekshiriladi)
export default function GiveCard({ date, data, onSaved }) {
  const closed = !!data.report?.isClosed;
  const [driverId, setDriverId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await bakerApi.giveDriver({ driverId, quantity, date });
      setQuantity('');
      onSaved();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <section className="card">
      <h2>Shofyorga non berish</h2>
      <form onSubmit={submit} className="grid2">
        <div>
          <label className="label">Shofyor</label>
          <select className="input" value={driverId} onChange={(e) => setDriverId(e.target.value)} disabled={closed}>
            <option value="">Tanlang...</option>
            {data.drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Non soni (dona)</label>
          <input
            className="input"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={closed}
            placeholder="0"
          />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={closed}>
            Berish
          </button>
        </div>
      </form>
      {err && <p className="form-error">{err}</p>}
      <ul className="list">
        {data.handoffs.map((h) => {
          const mismatch = h.confirmedQuantity != null && h.confirmedQuantity !== h.quantity;
          return (
            <li key={h._id} className="list-item">
              <div>
                <strong>{h.driver?.name}</strong>
                <div className="muted">Berildi: {h.quantity} dona</div>
                {h.confirmedQuantity == null ? (
                  <span className="badge">Shofyor tasdiqlamagan</span>
                ) : (
                  <span className={`badge ${mismatch ? 'badge-red' : 'badge-green'}`}>
                    Oldi: {h.confirmedQuantity}
                  </span>
                )}
              </div>
              <CommentButton targetModel="Handoff" refId={h._id} />
            </li>
          );
        })}
        {!data.handoffs.length && <li className="muted">Bugun shofyorga non berilmagan</li>}
      </ul>
    </section>
  );
}
