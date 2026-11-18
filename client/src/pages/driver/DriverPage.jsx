import { useCallback, useEffect, useState } from 'react';
import { driverApi } from '../../api';
import DateBar from '../../components/DateBar';
import { todayUz } from '../../utils/date';
import ReceiveCard from './ReceiveCard';
import DeliverCard from './DeliverCard';
import ExpenseCard from '../../components/ExpenseCard';

// Shofyor sahifasi: qabul qilish, dokonlarga tarqatish, rasxod, kunni tugatish
export default function DriverPage() {
  const [date, setDate] = useState(todayUz);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await driverApi.getDay(date));
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const closeDay = async () => {
    if (!window.confirm('Kunni tugatasizmi? Bu kuni boshqa ozgartira olmaysiz.')) return;
    try {
      await driverApi.closeDay(date);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (err && !data) {
    return (
      <>
        <DateBar value={date} onChange={setDate} />
        <p className="form-error">{err}</p>
      </>
    );
  }
  if (!data) return <p className="muted">Yuklanmoqda...</p>;

  const closed = Boolean(data.day?.isClosed);

  return (
    <>
      <DateBar value={date} onChange={setDate} />
      <section className="card">
        <div className="card-head">
          <h2>Kun yakuni</h2>
          {closed && <span className="badge badge-green">Tugatilgan</span>}
        </div>
        {closed ? (
          <p className="muted">Bu kun tugatilgan. Ozgartirish mumkin emas.</p>
        ) : (
          <div className="btn-row">
            <button className="btn btn-danger" onClick={closeDay}>
              Kunni tugatish
            </button>
          </div>
        )}
        {err && <p className="form-error">{err}</p>}
      </section>
      <ReceiveCard handoffs={data.handoffs} leftovers={data.leftovers} disabled={closed} onSaved={load} />
      <DeliverCard date={date} data={data} disabled={closed} onSaved={load} />
      <ExpenseCard date={date} expenses={data.expenses} disabled={closed} onSaved={load} />
    </>
  );
}
