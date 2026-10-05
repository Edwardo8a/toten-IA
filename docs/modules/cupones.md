# Módulo de Cupones y Clientes (`cupones`)

## 1. Propósito
Monitorear el estado de los cupones generados por el tótem y emitidos por WhatsApp, así como la demografía de clientes que interactúan con el sistema. Es un módulo de **solo lectura** para el dashboard de administración.

---

## 2. Implementación CQRS

### Queries
- **`GetCouponsQuery`**: `{ estado, limit }`
- **`GetClientStatsQuery`**: `{}`

### Query Handlers
- **`GetCouponsQueryHandler`**:
  - Consulta la tabla `cupones` en Supabase.
  - Filtra opcionalmente por `estado` (`activo`, `canjeado`, `expirado`).
  - Ordena por `fecha_creacion desc`.
- **`GetClientStatsQueryHandler`**:
  - Consulta la tabla `clientes` en Supabase.
  - Agrupa por `rango_edad` y `genero_detectado`.
  - Retorna conteos listos para alimentar gráficos de dona o barras en el frontend.

---

## 3. Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/cupones` | Sí | Listado de cupones (`?estado=activo\|canjeado\|expirado`) |
| `GET` | `/api/clientes/stats` | Sí | Estadísticas demográficas de clientes |

### Ejemplo Response `/api/clientes/stats`:
```json
{
  "total_clientes": 120,
  "demografia": [
    { "rango_edad": "18-25", "genero_detectado": "Femenino", "total": 45 },
    { "rango_edad": "26-35", "genero_detectado": "Masculino", "total": 38 },
    { "rango_edad": "18-25", "genero_detectado": "Masculino", "total": 22 },
    { "rango_edad": "36-50", "genero_detectado": "Femenino", "total": 15 }
  ]
}
```
