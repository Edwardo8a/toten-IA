# Módulo de Estadísticas y Sugerencias (`estadisticas`)

## 1. Propósito
Alimentar el motor de recomendaciones del tótem interactivo de Café Lobo en dos niveles de inteligencia:
- **Nivel 1 (Segmentación):** Recomendaciones basadas en demografía (edad y género detectados por la cámara del tótem).
- **Nivel 2 (Afinidad / Market Basket Analysis):** Recomendaciones cruzadas basadas en co-ocurrencia real de compra en los recibos de Loyverse ("quién compró X también compró Y").

---

## 2. Implementación CQRS

### Queries
- **`GetTopProductsBySegmentQuery`**: `{ segmento, valor }`
- **`GetProductAffinityQuery`**: `{ producto_id, loyverse_handle, variant_id }`

### Query Handlers
- **`GetTopProductsBySegmentQueryHandler` (Nivel 1)**:
  - Consulta `interacciones_totem` en Supabase filtrando por `edad_capturada` o `genero_capturado`.
  - Agrupa y cuenta recomendaciones por `producto_recomendado_id`.
  - Cruza con el catálogo de `productos` para enriquecer con nombre, categoría y precio.
  - Ordena de mayor a menor frecuencia de recomendación.
- **`GetProductAffinityQueryHandler` (Nivel 2)**:
  - Obtiene el identificador y SKU/Handle del producto objetivo (`target`).
  - Obtiene los recibos recientes de Loyverse.
  - Identifica aquellos tickets donde se compró el producto objetivo.
  - Calcula la frecuencia con la que los demás productos aparecen en la misma canasta.
  - Retorna el porcentaje de afinidad ordenado por probabilidad de venta cruzada.

---

## 3. Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/estadisticas/top-productos` | Sí | Nivel 1: Top sugerencias por edad o género (`?segmento=edad&valor=18-25`) |
| `GET` | `/api/estadisticas/afinidad` | Sí | Nivel 2: Productos afines para venta cruzada (`?producto_id=3`) |

### Ejemplo Response `/api/estadisticas/afinidad`:
```json
{
  "producto_target": {
    "producto_id": "3",
    "nombre": "Café Americano",
    "loyverse_handle": "cafe-americano"
  },
  "recibos_analizados_con_target": 40,
  "total_recibos_muestra: 500,
  "productos_afines": [
    {
      "nombre": "Croissant de Mantequilla",
      "sku": "croissant-mantequilla",
      "veces_juntos": 26,
      "porcentaje_afinidad": "65%",
      "score": 65
    },
    {
      "nombre": "Galleta Choco Chips",
      "sku": "galleta-choco-chips",
      "veces_juntos": 14,
      "porcentaje_afinidad": "35%",
      "score": 35
    }
  ]
}
```
*(El tótem usa este 65% de afinidad para mostrar en pantalla: "¿Te gustaría agregar un Croissant de Mantequilla por solo $35 adicionales?").*
