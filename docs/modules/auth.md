# Módulo de Autenticación (`auth`)

## 1. Propósito
Proveer autenticación JWT para el panel de administración del tótem. Diseñado específicamente para un rol de administrador único para el hackatón, validando credenciales contra variables de entorno con hash bcrypt.

---

## 2. Implementación CQRS

### Commands
- **`LoginCommand(username, password)`**: Encapsula el intento de inicio de sesión.

### Handlers
- **`LoginCommandHandler`**:
  1. Valida que `username` y `password` no vengan vacíos (lanza `ValidationError`).
  2. Compara el `username` contra `ADMIN_USER`.
  3. Compara el `password` contra el hash `ADMIN_PASSWORD_HASH` usando `bcrypt.compare`.
  4. Si coincide, genera un JWT firmado con `JWT_SECRET` y expiración (`24h`).
  5. Retorna `{ token, token_type: "Bearer", expires_in, user }`.

---

## 3. Endpoints

| Método | Endpoint | Auth Requerida | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Inicia sesión y retorna JWT |
| `GET` | `/api/auth/me` | Sí (`Bearer`) | Valida token y retorna usuario |

### Ejemplo Request Login:
```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "cafelobo2026"
}
```

### Ejemplo Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "24h",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```
