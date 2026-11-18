import { useState } from 'react';
import Modal from './Modal';

// Admin tahrirlash modali
// maydonlar: [name, label, type] yoki [name, label, 'select', [{value, label}]]
export default function AdminEditModal({ title, fields, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState('');

  const set = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await onSave(form);
      onClose();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        {fields.map(([name, label, type, options]) => (
          <div key={name}>
            <label className="label">{label}</label>
            {type === 'checkbox' ? (
              <input type="checkbox" checked={!!form[name]} onChange={set(name)} />
            ) : type === 'select' ? (
              <select className="input" value={form[name] ?? ''} onChange={set(name)}>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                type={type || 'text'}
                value={form[name] ?? ''}
                onChange={set(name)}
                min={type === 'number' ? 0 : undefined}
              />
            )}
          </div>
        ))}
        {err && <p className="form-error">{err}</p>}
        <div className="btn-row" style={{ marginTop: 10 }}>
          <button className="btn btn-primary" type="submit">
            Saqlash
          </button>
          <button className="btn" type="button" onClick={onClose}>
            Bekor qilish
          </button>
        </div>
      </form>
    </Modal>
  );
}
