import { useState } from 'react';
import { driverApi } from '../../api';
import CommentButton from '../../components/CommentButton';

// Bitta qabul yozuvi: shofyor olgan sonini kiritadi va tasdiqlaydi
function HandoffRow({ h, disabled, onSaved }) {
  const [qty, setQty] = useState(h.confirmedQuantity ?? h.quantity);
  const [err, setErr] = useState('');

  const confirm = async () => {
    setErr('');
    try {
      await driverApi.confirm(h._id, Number(qty));
      onSaved();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const mismatch = h.confirmedQuantity != null && h.confirmedQuantity !== h.quantity;

  return (
    <li className="list-item">
      <div>
        <div>
          {h.baker?.name || 'Nonyov'} berdi: <b>{h.quantity}</b> dona
        </div>
        {h.confirmedQuantity == null ? (
          <span className="badge">Tasdiqlanmagan</span>
        ) : (
          <span className={`badge ${mismatch ? 'badge-red' : 'badge-green'}`}>
            Oldim: {h.confirmedQuantity}
          </span>
        )}
        {err && <p className="form-error">{err}</p>}
      </div>
      <div className="btn-row">
        <input
          className="input input-sm"
          type="number"
          min="0"
          disabled={disabled}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <button className="btn btn-sm btn-primary" onClick={confirm} disabled={disabled}>
          Qabul qildim
        </button>
        <CommentButton targetModel="Handoff" refId={h._id} />
      </div>
    </li>
  );
}

// 3 nonvoyxonadan olgan noni - har biri alohida qatorda
export default function ReceiveCard({ handoffs, leftovers, disabled = false, onSaved }) {
  const groups = [];
  for (const l of leftovers) {
    const items = handoffs.filter(
      (h) => h.bakery && String(h.bakery._id) === String(l.bakery)
    );
    if (items.length) groups.push({ name: l.name, leftover: l, items });
  }

  return (
    <section className="card">
      <h2>Non qabul qilish</h2>
      {!groups.length && <p className="muted">Bugun nonvoyxonalar non bermagan</p>}
      {groups.map((g) => (
        <div key={g.name} className="group">
          <div className="group-head">
            <strong>{g.name}</strong>
            <span className="muted">
              Qoldiq: <b className={g.leftover.leftover < 0 ? 'red' : ''}>{g.leftover.leftover}</b> dona
            </span>
          </div>
          <ul className="list">
            {g.items.map((h) => (
              <HandoffRow
                key={`${h._id}-${h.confirmedQuantity ?? 'x'}`}
                h={h}
                disabled={disabled}
                onSaved={onSaved}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
