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

/** * GLOBAL CONFIG: 
 * This ensures the base path always includes /api to match your backend routes.
 */
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

// Create and export the 'api' instance to use in Agent components
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('placiq_token'));
  const [loading, setLoading] = useState(true);

  /**
   * INTERCEPTOR:
   * This automatically injects the Bearer Token into every outgoing request
   * so your AI Agents know who is calling them.
   */
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem('placiq_token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }

    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (e) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('placiq_token', data.token);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('placiq_token', data.token);
    return data;
  };

  const demoLogin = async () => {
    const { data } = await api.post('/auth/demo');
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('placiq_token', data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('placiq_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);