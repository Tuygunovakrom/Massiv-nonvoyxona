import { useState } from 'react';
import AdminDay from './AdminDay';
import AdminUsers from './AdminUsers';
import AdminShops from './AdminShops';
import AdminComments from './AdminComments';
import AdminAudit from './AdminAudit';

const TABS = [
  ['day', 'Kun nazorati'],
  ['users', 'Foydalanuvchilar'],
  ['shops', "Do'konlar"],
  ['comments', 'Izohlar'],
  ['audit', 'Audit'],
];

// Admin paneli - tab'lar boyicha
export default function AdminPage() {
  const [tab, setTab] = useState('day');

  return (
    <>
      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'day' && <AdminDay />}
      {tab === 'users' && <AdminUsers />}
      {tab === 'shops' && <AdminShops />}
      {tab === 'comments' && <AdminComments />}
      {tab === 'audit' && <AdminAudit />}
    </>
  );
}
