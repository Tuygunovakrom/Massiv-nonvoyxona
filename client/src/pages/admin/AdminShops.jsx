import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { money } from '../../utils/date';

// Do'konlarni qoshish va 1 dona non narxini belgilash
export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState({ name: '', price: '' });
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      setShops(await adminApi.shops());
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await adminApi.createShop(form);
      setForm({ name: '', price: '' });
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const save = async (shop, name, price) => {
    setErr('');
    try {
      await adminApi.updateShop(shop._id, { name, price });
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <>
      <section className="card">
        <h2>Yangi do'kon</h2>
        <form onSubmit={create} className="grid2">
          <div>
            <label className="label">Do'kon nomi</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">1 dona non narxi (so'm)</label>
            <input
              className="input"
              type="number"
              min="1"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div>
            <button className="btn btn-primary" type="submit">
              Qoshish
            </button>
          </div>
        </form>
        {err && <p className="form-error">{err}</p>}
      </section>

      <section className="card">
        <h2>Do'konlar</h2>
        <ul className="list">
          {shops.map((s) => (
            <ShopRow key={s._id} shop={s} onSave={save} />
          ))}
          {!shops.length && <li className="muted">Do'kon yoq</li>}
        </ul>
      </section>
    </>
  );
}

function ShopRow({ shop, onSave }) {
  const [name, setName] = useState(shop.name);
  const [price, setPrice] = useState(shop.price);

  return (
    <li className="list-item">
      <div className="grid2" style={{ flex: 1 }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className="input"
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          title={`${money(shop.price)} so'm`}
        />
      </div>
      <button className="btn btn-sm btn-primary" onClick={() => onSave(shop, name, price)}>
        Saqlash
      </button>
    </li>
  );
}
