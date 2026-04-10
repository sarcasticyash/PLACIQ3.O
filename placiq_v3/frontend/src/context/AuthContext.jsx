// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();
// const API = import.meta.env.VITE_API_URL || '/api';

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('placiq_token'));
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       fetchUser();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const fetchUser = async () => {
//     try {
//       const { data } = await axios.get(`${API}/auth/me`);
//       setUser(data);
//     } catch (e) {
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     const { data } = await axios.post(`${API}/auth/login`, { email, password });
//     setToken(data.token);
//     setUser(data.user);
//     localStorage.setItem('placiq_token', data.token);
//     axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
//     return data;
//   };

//   const register = async (formData) => {
//     const { data } = await axios.post(`${API}/auth/register`, formData);
//     setToken(data.token);
//     setUser(data.user);
//     localStorage.setItem('placiq_token', data.token);
//     axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
//     return data;
//   };

//   const demoLogin = async () => {
//     const { data } = await axios.post(`${API}/auth/demo`);
//     setToken(data.token);
//     setUser(data.user);
//     localStorage.setItem('placiq_token', data.token);
//     axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
//     return data;
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('placiq_token');
//     delete axios.defaults.headers.common['Authorization'];
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout, setUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// FIX: This ensures the base path always includes /api to match your backend app.use('/api/auth', ...)
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('placiq_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/auth/me`);
      setUser(data);
    } catch (e) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('placiq_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post(`${API_BASE}/auth/register`, formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('placiq_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const demoLogin = async () => {
    const { data } = await axios.post(`${API_BASE}/auth/demo`);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('placiq_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('placiq_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);