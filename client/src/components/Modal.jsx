export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn btn-sm" onClick={onClose}>
            Yopish
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
