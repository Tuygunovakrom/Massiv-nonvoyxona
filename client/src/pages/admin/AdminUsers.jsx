import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api';
import AdminEditModal from '../../components/AdminEditModal';

const ROLE_UZ = { admin: 'Admin', nonvoy: 'Nonyov', shofyor: 'Shofyor' };

// Nonyvoy va shofyorlarni boshqarish: yaratish, parol, ochirib qoyish
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'nonvoy', bakery: '' });
  const [edit, setEdit] = useState(null); // {user}

  const load = useCallback(async () => {
    try {
      const [u, b] = await Promise.all([adminApi.users(), adminApi.bakeries()]);
      setUsers(u);
      setBakeries(b);
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await adminApi.createUser(form);
      setForm({ name: '', username: '', password: '', role: 'nonvoy', bakery: '' });
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const saveEdit = async (upd) => {
    const payload = { name: upd.name, username: upd.username };
    if (upd.password) payload.password = upd.password;
    if (edit.user.role === 'nonvoy') payload.bakery = upd.bakery;
    await adminApi.updateUser(edit.user._id, payload);
    await load();
  };

  const toggle = async (u) => {
    setErr('');
    try {
      await adminApi.updateUser(u._id, { isActive: !u.isActive });
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const editFields = edit
    ? [
        ['name', 'Ism', 'text'],
        ['username', 'Login', 'text'],
        ['password', "Yangi parol (bo'sh qoldirsa ozgarmaydi)", 'text'],
        ...(edit.user.role === 'nonvoy'
          ? [['bakery', 'Nonyovxona', 'select', bakeries.map((b) => ({ value: b._id, label: b.name }))]]
          : []),
      ]
    : [];

  return (
    <>
      <section className="card">
        <h2>Yangi foydalanuvchi</h2>
        <form onSubmit={create} className="grid2">
          <div>
            <label className="label">Ism</label>
            <input className="input" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="label">Login</label>
            <input className="input" value={form.username} onChange={set('username')} placeholder="masalan: nonvoy1" />
          </div>
          <div>
            <label className="label">Parol</label>
            <input className="input" value={form.password} onChange={set('password')} />
          </div>
          <div>
            <label className="label">Rol</label>
            <select className="input" value={form.role} onChange={set('role')}>
              <option value="nonvoy">Nonyov</option>
              <option value="shofyor">Shofyor</option>
            </select>
          </div>
          {form.role === 'nonvoy' && (
            <div>
              <label className="label">Nonyovxona</label>
              <select className="input" value={form.bakery} onChange={set('bakery')}>
                <option value="">Tanlang...</option>
                {bakeries.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <button className="btn btn-primary" type="submit">
              Yaratish
            </button>
          </div>
        </form>
        {err && <p className="form-error">{err}</p>}
      </section>

      <section className="card">
        <h2>Foydalanuvchilar</h2>
        <ul className="list">
          {users.map((u) => (
            <li key={u._id} className="list-item">
              <div>
                <strong>{u.name}</strong> · {u.username}
                <div className="muted">
                  {ROLE_UZ[u.role]}
                  {u.bakery ? ` · ${u.bakery.name}` : ''}
                </div>
                {u.isActive ? (
                  <span className="badge badge-green">Faol</span>
                ) : (
                  <span className="badge badge-red">Ochirilgan</span>
                )}
              </div>
              {u.role !== 'admin' && (
                <div className="btn-row">
                  <button className="btn btn-sm" onClick={() => setEdit({ user: u })}>
                    Tahrirlash
                  </button>
                  <button
                    className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => toggle(u)}
                  >
                    {u.isActive ? 'Ochirish' : 'Yoqish'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {edit && (
        <AdminEditModal
          title={`${edit.user.name} - tahrirlash`}
          fields={editFields}
          initial={{
            name: edit.user.name,
            username: edit.user.username,
            password: '',
            bakery: edit.user.bakery?._id || '',
          }}
          onSave={saveEdit}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
