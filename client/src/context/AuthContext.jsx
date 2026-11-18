import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

// Login holatini localStorage'da saqlash
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nv_user'));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('nv_token'));

  const login = (newToken, newUser) => {
    localStorage.setItem('nv_token', newToken);
    localStorage.setItem('nv_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('nv_token');
    localStorage.removeItem('nv_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
