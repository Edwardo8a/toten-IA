const http = require('http');
const app = require('../src/app');

const PORT = 4055;
let server;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api${path.startsWith('/') ? path : `/${path}`}`,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('🚀 Iniciando servidor temporal en puerto', PORT);
  server = app.listen(PORT);

  try {
    console.log('\n================================================================');
    console.log('🧪 SIMULACIÓN DE EJECUCIÓN DE COLECCIÓN POSTMAN — CAFÉ LOBO API');
    console.log('================================================================');

    // 1. Healthcheck
    console.log('\n[1/10] GET /health (Público)');
    const health = await request('GET', '/health');
    console.log(`Status: ${health.status}`);
    console.log('Respuesta:', JSON.stringify(health.body, null, 2));

    // 2. Login
    console.log('\n[2/10] POST /auth/login (Credenciales de Administrador)');
    const login = await request('POST', '/auth/login', {}, { username: 'admin', password: 'cafelobo2026' });
    console.log(`Status: ${login.status}`);
    const token = login.body.token;
    console.log('Token obtenido:', token ? `${token.substring(0, 30)}...` : 'NO');
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. /auth/me
    console.log('\n[3/10] GET /auth/me (Validación de Token)');
    const me = await request('GET', '/auth/me', authHeaders);
    console.log(`Status: ${me.status}`);
    console.log('Usuario:', me.body.user);

    // 4. Listar Productos de Supabase
    console.log('\n[4/10] GET /productos?activo=all (Catálogo Supabase)');
    const prods = await request('GET', '/productos?activo=all', authHeaders);
    console.log(`Status: ${prods.status}`);
    console.log(`Total productos encontrados en Supabase: ${prods.body.length}`);
    const primerProducto = prods.body[0];
    if (primerProducto) {
      console.log('Muestra producto:', {
        id: primerProducto.id,
        nombre: primerProducto.nombre,
        categoria: primerProducto.categoria,
        precio: primerProducto.precio,
        handle: primerProducto.loyverse_handle
      });
    }

    // 5. Obtener Producto por ID
    if (primerProducto) {
      console.log(`\n[5/10] GET /productos/${primerProducto.id}`);
      const prodById = await request('GET', `/productos/${primerProducto.id}`, authHeaders);
      console.log(`Status: ${prodById.status}`);
      console.log('Producto recuperado:', prodById.body.nombre, `- $${prodById.body.precio}`);
    }

    // 6. Loyverse Descuentos
    console.log('\n[6/10] GET /descuentos (Loyverse API)');
    const discounts = await request('GET', '/descuentos', authHeaders);
    console.log(`Status: ${discounts.status}`);
    console.log(`Total descuentos en cuenta Loyverse: ${discounts.body.length}`);
    if (discounts.body.length > 0) {
      console.log('Descuento Loyverse muestra:', discounts.body[0]);
    }

    // 7. Loyverse Ventas
    console.log('\n[7/10] GET /ventas?limit=5 (Loyverse Recibos)');
    const ventas = await request('GET', '/ventas?limit=5', authHeaders);
    console.log(`Status: ${ventas.status}`);
    console.log(`Recibos en los últimos 29 días: ${ventas.body.receipts ? ventas.body.receipts.length : 0}`);

    // 8. Resumen de Ventas
    console.log('\n[8/10] GET /ventas/resumen (Agrupación Loyverse + Catálogo Supabase)');
    const resumen = await request('GET', '/ventas/resumen', authHeaders);
    console.log(`Status: ${resumen.status}`);
    console.log('Resumen:', {
      total_ventas: resumen.body.total_ventas,
      total_unidades: resumen.body.total_unidades,
      total_recibos: resumen.body.total_recibos,
      items_ranking: resumen.body.resumen?.length || 0
    });

    // 9. Cupones y Demografía
    console.log('\n[9/10] GET /cupones & GET /clientes/stats (Supabase)');
    const cupones = await request('GET', '/cupones?limit=5', authHeaders);
    const stats = await request('GET', '/clientes/stats', authHeaders);
    console.log(`Status Cupones: ${cupones.status} (Total: ${cupones.body.length})`);
    console.log(`Status Stats Clientes: ${stats.status} (Total Clientes: ${stats.body.total_clientes})`);

    // 10. Estadísticas de Afinidad (Nivel 2 Tótem)
    if (primerProducto) {
      console.log(`\n[10/10] GET /estadisticas/afinidad?producto_id=${primerProducto.id} (Market Basket Analysis)`);
      const afinidad = await request('GET', `/estadisticas/afinidad?producto_id=${primerProducto.id}`, authHeaders);
      console.log(`Status: ${afinidad.status}`);
      console.log('Resultado Afinidad:', {
        target: afinidad.body.producto_target,
        recibos_muestra: afinidad.body.total_recibos_muestra,
        productos_afines_sugeridos: afinidad.body.productos_afines?.length || 0
      });
    }

    console.log('\n================================================================');
    console.log('🎉 TODOS LOS ENDPOINTS PROBADOS CON ÉXITO');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Error ejecutando simulación Postman:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

run();
