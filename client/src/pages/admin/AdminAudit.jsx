import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { MODEL_UZ, FIELD_UZ } from '../../utils/labels';

const ACTION_UZ = { update: 'Tuzatish', reopen: 'Kunni qayta ochish' };

// Admin kiritgan tuzatishlar tarixi
export default function AdminAudit() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    adminApi
      .audit()
      .then(setRows)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <section className="card">
      <h2>Audit tarixi</h2>
      {err && <p className="form-error">{err}</p>}
      <ul className="list">
        {rows.map((a) => (
          <li key={a._id} className="list-item">
            <div>
              <strong>{a.admin?.name}</strong>
              <span className="muted">
                {' '}
                · {ACTION_UZ[a.action] || a.action} · {MODEL_UZ[a.model] || a.model}
              </span>
              <div className="muted">{new Date(a.createdAt).toLocaleString('ru-RU')}</div>
              {a.changes.map((ch, i) => (
                <div key={i} className="muted">
                  {FIELD_UZ[ch.field] || ch.field}: <b>{String(ch.oldValue ?? '—')}</b> →{' '}
                  <b>{String(ch.newValue ?? '—')}</b>
                </div>
              ))}
            </div>
          </li>
        ))}
        {!rows.length && <li className="muted">Tarix bosh</li>}
      </ul>
    </section>
  );
}
