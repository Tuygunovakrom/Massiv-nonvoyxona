// Sana tanlash paneli (mobil uchun mos)
export default function DateBar({ value, onChange }) {
  return (
    <div className="datebar">
      <label className="label" htmlFor="nv-date">
        Sana
      </label>
      <input
        id="nv-date"
        type="date"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
