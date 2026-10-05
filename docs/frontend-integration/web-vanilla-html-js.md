# Integración Frontend: Vanilla HTML + CSS + JavaScript

Un panel ligero sin dependencias externas (solo HTML5 y el API nativo `fetch` del navegador) para interactuar con el backend de Café Lobo.

---

## Código Completo del Dashboard (`index.html`)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Panel de Administración Café Lobo</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 2rem; color: #1e293b; }
    .card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    input, select, button { padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 1rem; }
    button { background: #0f172a; color: white; cursor: pointer; border: none; font-weight: 500; }
    button:hover { background: #334155; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
    .hidden { display: none; }
    .tag { background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
  </style>
</head>
<body>

  <h1>☕ Café Lobo — Panel de Control CQRS</h1>

  <!-- 1. Sección de Login -->
  <div id="login-section" class="card">
    <h2>Iniciar Sesión</h2>
    <div style="display: flex; gap: 1rem;">
      <input type="text" id="username" placeholder="Usuario" value="admin">
      <input type="password" id="password" placeholder="Contraseña" value="cafelobo2026">
      <button onclick="login()">Ingresar</button>
    </div>
    <p id="login-error" style="color: red; margin-top: 0.5rem;"></p>
  </div>

  <!-- 2. Panel Principal (Protegido) -->
  <div id="dashboard-section" class="hidden">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <p id="user-info">Conectado como Administrador</p>
      <button onclick="logout()" style="background: #dc2626;">Cerrar Sesión</button>
    </div>

    <!-- Ofertas / Descuentos Loyverse -->
    <div class="card">
      <h2>🏷️ Descuentos en Loyverse (Tiempo Real)</h2>
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <input type="text" id="desc-nombre" placeholder="Nombre descuento (ej. Promo Tótem)">
        <select id="desc-tipo">
          <option value="FIXED_PERCENT">Porcentaje (%)</option>
          <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
        </select>
        <input type="number" id="desc-valor" placeholder="Valor (ej. 15)" style="width: 100px;">
        <button onclick="crearDescuento()">Crear Oferta</button>
      </div>
      <table id="descuentos-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="descuentos-body"></tbody>
      </table>
    </div>

    <!-- Catálogo de Productos -->
    <div class="card">
      <h2>🛍️ Catálogo de Productos</h2>
      <button onclick="cargarProductos()">Recargar Catálogo</button>
      <table id="productos-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Handle Loyverse</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="productos-body"></tbody>
      </table>
    </div>
  </div>

  <script>
    const API_URL = 'http://localhost:4000/api';
    let token = localStorage.getItem('jwt_cafe_lobo');

    function checkAuth() {
      if (token) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        cargarDescuentos();
        cargarProductos();
      } else {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('dashboard-section').classList.add('hidden');
      }
    }

    async function apiFetch(endpoint, options = {}) {
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
      if (res.status === 401) {
        logout();
        throw new Error('Sesión expirada');
      }
      return res.json();
    }

    async function login() {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        if (data.token) {
          token = data.token;
          localStorage.setItem('jwt_cafe_lobo', token);
          checkAuth();
        } else {
          document.getElementById('login-error').innerText = data.error || 'Credenciales inválidas';
        }
      } catch (err) {
        document.getElementById('login-error').innerText = err.message;
      }
    }

    function logout() {
      localStorage.removeItem('jwt_cafe_lobo');
      token = null;
      checkAuth();
    }

    async function cargarDescuentos() {
      const descuentos = await apiFetch('/descuentos');
      const tbody = document.getElementById('descuentos-body');
      tbody.innerHTML = descuentos.map(d => `
        <tr>
          <td><strong>${d.name}</strong></td>
          <td><span class="tag">${d.type}</span></td>
          <td>${d.discount_percent ? d.discount_percent + '%' : '$' + d.discount_amount}</td>
          <td><button onclick="eliminarDescuento('${d.id}')" style="background:#ef4444; padding:0.25rem 0.5rem; font-size:0.8rem;">Eliminar</button></td>
        </tr>
      `).join('');
    }

    async function crearDescuento() {
      const nombre = document.getElementById('desc-nombre').value;
      const tipo = document.getElementById('desc-tipo').value;
      const valor = document.getElementById('desc-valor').value;

      await apiFetch('/descuentos', {
        method: 'POST',
        body: JSON.stringify({ nombre, tipo, valor })
      });

      document.getElementById('desc-nombre').value = '';
      document.getElementById('desc-valor').value = '';
      cargarDescuentos();
    }

    async function eliminarDescuento(id) {
      if (confirm('¿Eliminar descuento en Loyverse?')) {
        await apiFetch(`/descuentos/${id}`, { method: 'DELETE' });
        cargarDescuentos();
      }
    }

    async function cargarProductos() {
      const productos = await apiFetch('/productos');
      const tbody = document.getElementById('productos-body');
      tbody.innerHTML = productos.map(p => `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.categoria || 'Sin categoría'}</td>
          <td>$${p.precio}</td>
          <td><code>${p.loyverse_handle || '-'}</code></td>
          <td><button onclick="desactivarProducto('${p.id}')" style="background:#e11d48; padding:0.25rem 0.5rem; font-size:0.8rem;">Desactivar</button></td>
        </tr>
      `).join('');
    }

    async function desactivarProducto(id) {
      if (confirm('¿Desactivar producto (baja lógica)?')) {
        await apiFetch(`/productos/${id}`, { method: 'DELETE' });
        cargarProductos();
      }
    }

    // Inicializar
    checkAuth();
  </script>
</body>
</html>
```
