import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api';
import DateBar from '../../components/DateBar';
import AdminEditModal from '../../components/AdminEditModal';
import { money, todayUz } from '../../utils/date';

const REPORT_FIELDS = [
  ['closedBread', 'Yopilgan non (dona)', 'number'],
  ['usedFlour', 'Un (qop)', 'number'],
  ['soldBread', 'Sotilgan non (dona)', 'number'],
  ['eatenBread', 'Yeyilgan non (dona)', 'number'],
  ['cash', "Naqd kassa (so'm)", 'number'],
  ['click', "Click kassa (so'm)", 'number'],
];

const HANDOFF_FIELDS = [
  ['quantity', 'Nonyov bergan (dona)', 'number'],
  ['confirmedQuantity', 'Shofyor olgan (dona)', 'number'],
];

const DELIVERY_FIELDS = [
  ['quantity', 'Non soni', 'number'],
  ['cash', "Naqd pul (so'm)", 'number'],
  ['click', "Click pul (so'm)", 'number'],
];

const EXPENSE_FIELDS = [
  ['amount', "Summa (so'm)", 'number'],
  ['reason', 'Nimaga ketdi', 'text'],
];

const ORDER_FIELDS = [
  ['customerName', 'Mijoz', 'text'],
  ['phone', 'Telefon', 'text'],
  ['quantity', 'Non soni', 'number'],
  ['date', 'Sana', 'date'],
  ['note', 'Izoh', 'text'],
  ['isDone', 'Tugatilganmi', 'checkbox'],
];

// Sana boyicha umumiy nazorat
export default function AdminDay() {
  const [date, setDate] = useState(todayUz);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [edit, setEdit] = useState(null); // {kind, id, title, fields, initial}

  const load = useCallback(async () => {
    try {
      setData(await adminApi.day(date));
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const saveEdit = async (form) => {
    await adminApi.update(edit.kind, edit.id, form);
    await load();
  };

  const reopen = async (id) => {
    if (!window.confirm('Kunni qayta ochasizmi?')) return;
    try {
      await adminApi.reopen(id);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const reopenDriverDay = async (id) => {
    if (!window.confirm('Shofyor kunini qayta ochasizmi?')) return;
    try {
      await adminApi.reopenDriverDay(id);
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

  const t = data.totals;

  return (
    <>
      <DateBar value={date} onChange={setDate} />
      {err && <p className="form-error">{err}</p>}

      <section className="card">
        <h2>Jami pul tushumi</h2>
        <div className="stat-grid">
          <div className="stat">
            <span>Nonyovxona kassasi: naqd</span>
            <b>{money(t.bakeryCash)} so'm</b>
          </div>
          <div className="stat">
            <span>Nonyovxona kassasi: Click</span>
            <b>{money(t.bakeryClick)} so'm</b>
          </div>
          <div className="stat">
            <span>Shofyor yigdi: naqd</span>
            <b>{money(t.driverCash)} so'm</b>
          </div>
          <div className="stat">
            <span>Shofyor yigdi: Click</span>
            <b>{money(t.driverClick)} so'm</b>
          </div>
        </div>
        <p className="kv" style={{ marginTop: 10 }}>
          <span>
            Nonyovxona jami: <b>{money(t.bakeryTotal)} so'm</b>
          </span>
          <span>
            Shofyorlar jami: <b>{money(t.driverTotal)} so'm</b>
          </span>
          <span>
            <b>UMUMIY: {money(t.grandTotal)} so'm</b>
          </span>
          <span className="muted">Ochiq izohlar: {data.openComments}</span>
        </p>
      </section>

      <h2 className="section-title">Nonyovxona hisobotlari</h2>
      {!data.reports.length && <p className="muted">Bu kunda hisobot yoq</p>}
      {data.reports.map((r) => (
        <section className="card" key={r._id}>
          <div className="card-head">
            <h3>{r.bakery?.name}</h3>
            {r.isClosed ? <span className="badge badge-green">Tugatilgan</span> : <span className="badge">Ochiq</span>}
          </div>
          <p className="muted">Nonyov: {r.baker?.name}</p>
          <div className="kv">
            <span>
              Yopilgan: <b>{r.closedBread}</b>
            </span>
            <span>
              Un: <b>{r.usedFlour}</b> qop
            </span>
            <span>
              Sotilgan: <b>{r.soldBread}</b>
            </span>
            <span>
              Yeyilgan: <b>{r.eatenBread}</b>
            </span>
            <span>
              Naqd: <b>{money(r.cash)}</b>
            </span>
            <span>
              Click: <b>{money(r.click)}</b>
            </span>
          </div>
          <div className="kv">
            <span>
              Shofyorga berilgan: <b>{r.givenTotal}</b> dona
            </span>
            <span>
              Qoldiq: <b className={r.leftover < 0 ? 'red' : ''}>{r.leftover}</b> dona
            </span>
          </div>
          <div className="btn-row">
            <button
              className="btn btn-sm"
              onClick={() =>
                setEdit({
                  kind: 'reports',
                  id: r._id,
                  title: `${r.bakery?.name} hisobotini tuzatish`,
                  fields: REPORT_FIELDS,
                  initial: {
                    closedBread: r.closedBread,
                    usedFlour: r.usedFlour,
                    soldBread: r.soldBread,
                    eatenBread: r.eatenBread,
                    cash: r.cash,
                    click: r.click,
                  },
                })
              }
            >
              Tuzatish
            </button>
            {r.isClosed && (
              <button className="btn btn-sm btn-danger" onClick={() => reopen(r._id)}>
                Kunni qayta ochish
              </button>
            )}
          </div>
        </section>
      ))}

      <h2 className="section-title">Shofyorlar natijasi</h2>
      {!data.drivers.length && <p className="muted">Shofyor harakati yoq</p>}
      {data.drivers.map((d) => (
        <section className="card" key={d.driver._id}>
          <div className="card-head">
            <h3>{d.driver.name}</h3>
            {d.day?.isClosed && <span className="badge badge-green">Kun tugatilgan</span>}
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nonyovxona</th>
                  <th>Berdi</th>
                  <th>Oldi</th>
                  <th>Farq</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((row) => {
                  const diff = row.confirmed - row.given;
                  const mismatch = !row.pending && diff !== 0;
                  return (
                    <tr key={row.bakery._id}>
                      <td>{row.bakery.name}</td>
                      <td>{row.given}</td>
                      <td>{row.pending && row.confirmed === 0 ? '—' : row.confirmed}</td>
                      <td className={mismatch ? 'red' : ''}>
                        {row.pending && row.confirmed === 0 ? 'kutilmoqda' : diff === 0 ? 'mos' : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="muted">
            Yigdi: naqd {money(d.collected.cash)} · Click {money(d.collected.click)} so'm
          </p>
          {d.day?.isClosed && (
            <div className="btn-row">
              <button className="btn btn-sm btn-danger" onClick={() => reopenDriverDay(d.day._id)}>
                Kunni qayta ochish
              </button>
            </div>
          )}

          <h4>Berish yozuvlari</h4>
          <ul className="list">
            {d.handoffs.map((h) => (
              <li key={h._id} className="list-item">
                <div>
                  {h.bakery?.name} · {h.bakerName}
                  <div className="muted">
                    Berdi: {h.quantity} · Oldi: {h.confirmedQuantity ?? '—'}
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    setEdit({
                      kind: 'handoffs',
                      id: h._id,
                      title: 'Berish yozuvini tuzatish',
                      fields: HANDOFF_FIELDS,
                      initial: { quantity: h.quantity, confirmedQuantity: h.confirmedQuantity ?? 0 },
                    })
                  }
                >
                  Tuzatish
                </button>
              </li>
            ))}
          </ul>

          <h4>Tarqatishlar</h4>
          <ul className="list">
            {d.deliveries.map((del) => (
              <li key={del._id} className="list-item">
                <div>
                  {del.shop?.name} · {del.bakery?.name}
                  <div className="muted">
                    {del.quantity} dona · naqd {money(del.cash)} · Click {money(del.click)}
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    setEdit({
                      kind: 'deliveries',
                      id: del._id,
                      title: 'Tarqatishni tuzatish',
                      fields: DELIVERY_FIELDS,
                      initial: { quantity: del.quantity, cash: del.cash, click: del.click },
                    })
                  }
                >
                  Tuzatish
                </button>
              </li>
            ))}
            {!d.deliveries.length && <li className="muted">Tarqatilmagan</li>}
          </ul>
        </section>
      ))}

      <h2 className="section-title">Rasxodlar</h2>
      <section className="card">
        <ul className="list">
          {data.expenses.map((x) => (
            <li key={x._id} className="list-item">
              <div>
                <strong>{money(x.amount)} so'm</strong> — {x.reason}
                <div className="muted">
                  {x.user?.name} ({x.role === 'nonvoy' ? 'nonyov' : 'shofyor'})
                  {x.bakery ? ` · ${x.bakery.name}` : ''}
                </div>
              </div>
              <button
                className="btn btn-sm"
                onClick={() =>
                  setEdit({
                    kind: 'expenses',
                    id: x._id,
                    title: 'Rasxodni tuzatish',
                    fields: EXPENSE_FIELDS,
                    initial: { amount: x.amount, reason: x.reason },
                  })
                }
              >
                Tuzatish
              </button>
            </li>
          ))}
          {!data.expenses.length && <li className="muted">Rasxod yoq</li>}
        </ul>
      </section>

      <h2 className="section-title">Zakazlar</h2>
      <section className="card">
        <ul className="list">
          {data.orders.map((o) => (
            <li key={o._id} className="list-item">
              <div>
                <strong>{o.customerName}</strong> · {o.phone}
                <div className="muted">
                  {o.bakery?.name} · {o.quantity} dona {o.note ? `· ${o.note}` : ''}
                </div>
                {o.isDone ? <span className="badge badge-green">Tugatilgan</span> : <span className="badge badge-red">Kutulyapti</span>}
              </div>
              <button
                className="btn btn-sm"
                onClick={() =>
                  setEdit({
                    kind: 'orders',
                    id: o._id,
                    title: 'Zakazni tuzatish',
                    fields: ORDER_FIELDS,
                    initial: {
                      customerName: o.customerName,
                      phone: o.phone,
                      quantity: o.quantity,
                      date: o.date,
                      note: o.note,
                      isDone: o.isDone,
                    },
                  })
                }
              >
                Tuzatish
              </button>
            </li>
          ))}
          {!data.orders.length && <li className="muted">Zakaz yoq</li>}
        </ul>
      </section>

      {edit && (
        <AdminEditModal
          title={edit.title}
          fields={edit.fields}
          initial={edit.initial}
          onSave={saveEdit}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
