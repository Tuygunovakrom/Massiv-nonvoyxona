import { useCallback, useEffect, useState } from 'react';
import { bakerApi } from '../../api';
import DateBar from '../../components/DateBar';
import { todayUz } from '../../utils/date';
import ReportCard from './ReportCard';
import GiveCard from './GiveCard';
import OrdersCard from './OrdersCard';
import ExpenseCard from '../../components/ExpenseCard';

// Nonyov sahifasi: hisobot, shofyorga berish, zakazlar, rasxod
export default function BakerPage() {
  const [date, setDate] = useState(todayUz);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await bakerApi.getDay(date));
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  if (err && !data) {
    return (
      <>
        <DateBar value={date} onChange={setDate} />
        <p className="form-error">{err}</p>
      </>
    );
  }
  if (!data) return <p className="muted">Yuklanmoqda...</p>;

  return (
    <>
      <DateBar value={date} onChange={setDate} />
      {data.report?.isClosed && (
        <div className="banner">
          Bu kun tugatilgan. Ozgartirish kerak bolsa adminga murojaat qiling.
        </div>
      )}
      <ReportCard date={date} data={data} onSaved={load} />
      <GiveCard date={date} data={data} onSaved={load} />
      <OrdersCard date={date} orders={data.orders} onChanged={load} />
      <ExpenseCard date={date} expenses={data.expenses} onSaved={load} />
    </>
  );
}
