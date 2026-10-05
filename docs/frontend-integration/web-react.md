# Integración Frontend: React + TypeScript / JavaScript

Guía para conectar un dashboard web desarrollado en **React** (Vite o Next.js) con el backend CQRS de Café Lobo.

---

## 1. Cliente HTTP y Manejo de JWT (Axios / Fetch)

Crea un servicio base de API que inyecte automáticamente el token JWT y maneje la redirección si el token expira:

```typescript
// src/api/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_cafe_lobo');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar expiración de sesión (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token_cafe_lobo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Contexto de Autenticación (`AuthContext.tsx`)

```tsx
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

interface AuthContextType {
  token: string | null;
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token_cafe_lobo'));
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (token) {
      apiClient.get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await apiClient.post('/auth/login', { username, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('token_cafe_lobo', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = () => {
    localStorage.removeItem('token_cafe_lobo');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
```

---

## 3. Custom Hook para Catálogo y Comandos (`useProductos.ts`)

```typescript
// src/hooks/useProductos.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  costo: number;
  activo: boolean;
  loyverse_handle?: string;
  loyverse_variant_id?: string;
}

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/productos');
      setProductos(res.data);
    } finally {
      setLoading(false);
    }
  };

  const crearProducto = async (data: Omit<Producto, 'id' | 'activo'>) => {
    const res = await apiClient.post('/productos', data);
    await fetchProductos();
    return res.data;
  };

  const desactivarProducto = async (id: string) => {
    await apiClient.delete(`/productos/${id}`);
    await fetchProductos();
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return { productos, loading, fetchProductos, crearProducto, desactivarProducto };
}
```

---

## 4. Componente React: Resumen de Ventas y Sugerencias de Afinidad

```tsx
// src/components/DashboardStats.tsx
import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/apiClient';

export const DashboardStats: React.FC = () => {
  const [ventasResumen, setVentasResumen] = useState<any>(null);
  const [afinidad, setAfinidad] = useState<any>(null);

  useEffect(() => {
    // Consultar resumen de ventas
    apiClient.get('/ventas/resumen').then((res) => setVentasResumen(res.data));

    // Consultar afinidad para el producto más vendido o producto seleccionado
    apiClient.get('/estadisticas/afinidad?producto_id=1').then((res) => setAfinidad(res.data));
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Resumen de Ventas */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">🏆 Productos Más Vendidos</h2>
        <p className="text-gray-500 mb-2">Total Recaudado: ${ventasResumen?.total_ventas || 0}</p>
        <ul className="divide-y">
          {ventasResumen?.resumen?.map((item: any) => (
            <li key={item.nombre} className="py-2 flex justify-between">
              <span>{item.nombre} ({item.categoria})</span>
              <span className="font-semibold">{item.unidades} uds (${item.total_dinero})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sugerencias de Afinidad Tótem */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">🧠 Afinidad para Venta Cruzada (Tótem)</h2>
        <p className="text-sm text-gray-500 mb-2">
          Objetivo: {afinidad?.producto_target?.nombre || 'Producto Principal'}
        </p>
        <div className="space-y-3">
          {afinidad?.productos_afines?.map((prod: any) => (
            <div key={prod.sku} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span>{prod.nombre}</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
                {prod.porcentaje_afinidad} de co-ocurrencia
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```
