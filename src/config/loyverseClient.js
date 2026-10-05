const env = require('./env');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class LoyverseClient {
  constructor() {
    this.baseUrl = env.LOYVERSE_BASE_URL;
    this.token = env.LOYVERSE_TOKEN;
  }

  /**
   * Realiza una petición a la API de Loyverse con manejo de errores y reintentos (backoff).
   * @param {string} endpoint - Ejemplo: '/items', '/discounts', '/receipts'
   * @param {object} options - Opciones de fetch: method, body, headers, retries
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      query,
      headers = {},
      maxRetries = 3,
      initialDelayMs = 500,
      logPayload = true
    } = options;

    if (!this.token) {
      throw new Error('LOYVERSE_TOKEN no está configurado en las variables de entorno.');
    }

    let urlStr = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (query && Object.keys(query).length > 0) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== '') {
          sp.append(k, String(v));
        }
      }
      const qs = sp.toString();
      if (qs) {
        urlStr += (urlStr.includes('?') ? '&' : '?') + qs;
      }
    }

    const requestHeaders = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json',
      ...headers
    };

    let serializedBody;
    if (body !== undefined && body !== null) {
      requestHeaders['Content-Type'] = 'application/json';
      serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let lastError = null;
    let delay = initialDelayMs;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (logPayload && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
          console.log(`[LoyverseClient] [${method}] ${urlStr} (Intento ${attempt}/${maxRetries})`);
          if (serializedBody) {
            console.log(`[LoyverseClient] Payload:`, serializedBody);
          }
        }

        const response = await fetch(urlStr, {
          method,
          headers: requestHeaders,
          body: serializedBody
        });

        const status = response.status;
        let responseData = null;
        const contentType = response.headers.get('content-type') || '';

        if (status !== 204 && contentType.includes('application/json')) {
          try {
            responseData = await response.json();
          } catch {
            responseData = null;
          }
        } else if (status !== 204) {
          try {
            responseData = await response.text();
          } catch {
            responseData = null;
          }
        }

        if (logPayload && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
          console.log(`[LoyverseClient] Respuesta Status: ${status}`);
          console.log(`[LoyverseClient] Respuesta Body:`, JSON.stringify(responseData, null, 2));
        }

        if (response.ok) {
          return responseData;
        }

        const isRetryable = status === 429 || (status >= 500 && status < 600);
        if (isRetryable && attempt < maxRetries) {
          console.warn(`[LoyverseClient] Status ${status} en ${method} ${urlStr}. Reintentando en ${delay}ms...`);
          await sleep(delay);
          delay *= 2;
          continue;
        }

        const error = new Error(`Error en Loyverse API [${method} ${endpoint}]: ${status} ${response.statusText}`);
        error.status = status;
        error.statusText = response.statusText;
        error.data = responseData;
        throw error;
      } catch (err) {
        lastError = err;
        if (!err.status && attempt < maxRetries) {
          console.warn(`[LoyverseClient] Error de conexión (${err.message}). Reintentando en ${delay}ms...`);
          await sleep(delay);
          delay *= 2;
          continue;
        }
        if (err.status) {
          throw err;
        }
      }
    }

    throw lastError;
  }

  get(endpoint, query, options = {}) {
    return this.request(endpoint, { method: 'GET', query, ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'PUT', body, ...options });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

module.exports = new LoyverseClient();
