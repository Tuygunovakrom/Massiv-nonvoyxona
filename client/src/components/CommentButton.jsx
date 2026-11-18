import { useState } from 'react';
import { sharedApi } from '../api';
import Modal from './Modal';

// Yozuv yonida adminga izoh yuborish tugmasi
export default function CommentButton({ targetModel, refId }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [state, setState] = useState(null); // 'sent' | xato matni

  const send = async () => {
    if (!text.trim()) return;
    try {
      await sharedApi.addComment({ targetModel, refId, text: text.trim() });
      setState('sent');
      setText('');
      setTimeout(() => {
        setOpen(false);
        setState(null);
      }, 900);
    } catch (e) {
      setState(e.message);
    }
  };

  return (
    <>
      <button className="btn btn-sm" onClick={() => setOpen(true)}>
        Izoh yozish
      </button>
      {open && (
        <Modal title="Adminga izoh" onClose={() => setOpen(false)}>
          <textarea
            className="input"
            rows="3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Masalan: 120 emas, 102 bolishi kerak"
          />
          {state === 'sent' ? (
            <p className="ok-text">Izoh yuborildi</p>
          ) : state ? (
            <p className="form-error">{state}</p>
          ) : null}
          <button className="btn btn-primary" onClick={send}>
            Yuborish
          </button>
        </Modal>
      )}
    </>
  );
}
