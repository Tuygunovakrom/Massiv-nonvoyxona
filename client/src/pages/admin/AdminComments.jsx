import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { MODEL_UZ } from '../../utils/labels';

// Admin izohlarni koradi va "Hal qilindi" deb belgilaydi
export default function AdminComments() {
  const [status, setStatus] = useState('open');
  const [comments, setComments] = useState([]);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      setComments(await adminApi.comments(status));
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (id) => {
    setErr('');
    try {
      await adminApi.resolveComment(id);
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>Izohlar</h2>
        <select className="input input-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Ochiq</option>
          <option value="resolved">Hal qilingan</option>
          <option value="">Barchasi</option>
        </select>
      </div>
      {err && <p className="form-error">{err}</p>}
      <ul className="list">
        {comments.map((c) => (
          <li key={c._id} className="list-item">
            <div>
              <div>
                <strong>{c.author?.name}</strong>
                <span className="muted">
                  {' '}
                  ({c.author?.role === 'nonvoy' ? 'nonyov' : 'shofyor'})
                  {c.bakery ? ` · ${c.bakery.name}` : ''}
                </span>
              </div>
              <div>{c.text}</div>
              <div className="muted">
                {MODEL_UZ[c.targetModel] || c.targetModel} ·{' '}
                {new Date(c.createdAt).toLocaleString('ru-RU')}
              </div>
              {c.status === 'open' ? (
                <span className="badge badge-red">Ochiq</span>
              ) : (
                <span className="badge badge-green">Hal qilingan</span>
              )}
            </div>
            {c.status === 'open' && (
              <button className="btn btn-sm btn-primary" onClick={() => resolve(c._id)}>
                Hal qilindi
              </button>
            )}
          </li>
        ))}
        {!comments.length && <li className="muted">Izoh yoq</li>}
      </ul>
    </section>
  );
}
