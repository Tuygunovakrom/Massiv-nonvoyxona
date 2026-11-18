import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ROLE_UZ = { admin: 'Admin', nonvoy: 'Nonyov', shofyor: 'Shofyor' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const exit = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="topbar-title">Nonyovxona boshqaruvi</div>
          <div className="topbar-sub">
            {user.name} · {ROLE_UZ[user.role] || user.role}
          </div>
        </div>
        <button className="btn btn-sm" onClick={exit}>
          Chiqish
        </button>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
