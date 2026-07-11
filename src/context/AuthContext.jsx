import { createContext, useContext, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('safi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('safi_token'));

  async function login(phone, password) {
    const data = await api.login(phone, password);
    if (data.user.user_type !== 'admin') {
      throw new Error("Ce compte n'a pas accès à l'interface admin");
    }
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('safi_user', JSON.stringify(data.user));
    localStorage.setItem('safi_token', data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('safi_user');
    localStorage.removeItem('safi_token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
