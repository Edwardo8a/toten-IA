# Módulo de Ventas (`ventas`)

## 1. Propósito
Proveer visibilidad de las transacciones reales registradas en Loyverse POS (recibos) y generar resúmenes consolidados de productos vendidos cruzando datos de tickets con el catálogo de Supabase.

---

## 2. Implementación CQRS (Queries Puras)

### Queries
- **`GetReceiptsQuery`**: `{ created_at_min, created_at_max, store_id, cursor, limit, auto_paginate }`
- **`GetSalesSummaryQuery`**: `{ created_at_min, created_at_max, store_id }`

### Query Handlers
- **`GetReceiptsQueryHandler`**:
  - Consulta `GET /receipts` de Loyverse.
  - Si `auto_paginate = true`, recorre los cursores automáticamente hasta reunir todas las páginas del rango de fechas pedido.
- **`GetSalesSummaryQueryHandler`**:
  - Obtiene los recibos de Loyverse del rango especificado.
  - Carga el catálogo de Supabase en memoria (`loyverse_variant_id` y `loyverse_handle`).
  - Itera los `line_items` de cada recibo.
  - Agrupa las variantes de un mismo producto por su Handle o SKU compartido (de este modo, las ventas de "Café Americano Chico" y "Grande" consolidan bajo el mismo producto).
  - Calcula unidades vendidas, ingresos totales y precio promedio.
  - Ordena de forma descendente por volumen de unidades.

---

## 3. Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/ventas` | Sí | Listado de recibos paginados de Loyverse |
| `GET` | `/api/ventas/resumen` | Sí | Resumen consolidado de ventas por producto |

### Ejemplo Response `/api/ventas/resumen`:
```json
{
  "resumen": [
    {
      "producto_id": "1",
      "nombre": "Café Americano",
      "categoria": "Cafetería",
      "loyverse_handle": "cafe-americano",
      "unidades": 45,
      "total_dinero": 2160.00,
      "precio_promedio": 48.00,
      "recibos_count": 38
    }
  ],
  "total_ventas": 2160.00,
  "total_unidades": 45,
  "total_recibos": 38
}
```
