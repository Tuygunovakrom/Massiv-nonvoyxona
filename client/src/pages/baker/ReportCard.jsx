import { useEffect, useState } from 'react';
import { bakerApi } from '../../api';
import CommentButton from '../../components/CommentButton';

// Kunlik hisobot: yopilgan non, un, sotilgan, yeyilgan, kassa (naqd/Click)
export default function ReportCard({ date, data, onSaved }) {
  const report = data.report;
  const closed = !!report?.isClosed;
  const [form, setForm] = useState({
    closedBread: 0,
    usedFlour: 0,
    soldBread: 0,
    eatenBread: 0,
    cash: 0,
    click: 0,
  });
  const [err, setErr] = useState('');

  useEffect(() => {
    setForm({
      closedBread: report?.closedBread ?? 0,
      usedFlour: report?.usedFlour ?? 0,
      soldBread: report?.soldBread ?? 0,
      eatenBread: report?.eatenBread ?? 0,
      cash: report?.cash ?? 0,
      click: report?.click ?? 0,
    });
    setErr('');
  }, [report?._id, date]);

  // Qoldiq oldindan korinishi
  const qoldiq =
    Number(form.closedBread || 0) -
    Number(form.soldBread || 0) -
    Number(form.eatenBread || 0) -
    (data.givenTotal || 0);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await bakerApi.saveReport({ date, ...form });
      onSaved();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const close = async () => {
    if (!window.confirm('Kunni tugatasizmi? Bu kuni boshqa ozgartira olmaysiz.')) return;
    setErr('');
    try {
      await bakerApi.closeDay(date);
      onSaved();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>Kunlik hisobot</h2>
        {closed && <span className="badge">Tugatilgan</span>}
      </div>
      <form onSubmit={save}>
        <div className="grid2">
          <div>
            <label className="label">Yopilgan non (dona)</label>
            <input className="input" type="number" min="0" disabled={closed} value={form.closedBread} onChange={set('closedBread')} />
          </div>
          <div>
            <label className="label">Ishlatilgan un (qop)</label>
            <input className="input" type="number" min="0" disabled={closed} value={form.usedFlour} onChange={set('usedFlour')} />
          </div>
          <div>
            <label className="label">Sotilgan non (dona)</label>
            <input className="input" type="number" min="0" disabled={closed} value={form.soldBread} onChange={set('soldBread')} />
          </div>
          <div>
            <label className="label">Yeyilgan non (dona)</label>
            <input className="input" type="number" min="0" disabled={closed} value={form.eatenBread} onChange={set('eatenBread')} />
          </div>
          <div>
            <label className="label">Kassa: naqd (so'm)</label>
            <input className="input" type="number" min="0" disabled={closed} value={form.cash} onChange={set('cash')} />
          </div>
          <div>
            <label className="label">Kassa: Click (so'm)</label>
            <input className="input" type="number" min="0" disabled={closed} value={form.click} onChange={set('click')} />
          </div>
        </div>
        <div className="kv">
          <span>
            Shofyorga berilgan: <b>{data.givenTotal}</b> dona
          </span>
          <span>
            Qoldiq: <b className={qoldiq < 0 ? 'red' : ''}>{qoldiq}</b> dona
          </span>
        </div>
        {err && <p className="form-error">{err}</p>}
        <div className="btn-row">
          <button className="btn btn-primary" type="submit" disabled={closed}>
            Saqlash
          </button>
          {!closed && (
            <button className="btn btn-danger" type="button" onClick={close}>
              Kunni tugatish
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
