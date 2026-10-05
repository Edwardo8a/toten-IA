# Módulo de Productos (`productos`)

## 1. Propósito
Administrar el catálogo de productos de Café Lobo en Supabase y mantener sincronizado el catálogo espejo en Loyverse POS.

---

## 2. Implementación CQRS

### Commands (Mutaciones)
- **`CreateProductCommand`**: `{ nombre, categoria, descripcion, precio, costo, etiquetas_demograficas, loyverse_handle, loyverse_ref }`
- **`UpdateProductCommand`**: `{ id, data }`
- **`DeactivateProductCommand`**: `{ id }`

### Command Handlers
- **`CreateProductCommandHandler`**:
  1. Si no se provee `loyverse_handle`, lo genera automáticamente usando la utilidad `slugify(nombre)`.
  2. Inserta el registro en la tabla `productos` de Supabase (`activo = true`).
  3. Llama a `POST /items` en Loyverse con el payload confirmado:
     ```json
     {
       "item_name": nombre,
       "variants": [
         {
           "sku": handle,
           "cost": costo,
           "default_price": precio,
           "default_pricing_type": "FIXED"
         }
       ]
     }
     ```
  4. Extrae `variants[0].variant_id` y actualiza `loyverse_variant_id` en Supabase.
  5. **Manejo de sincronización:** Si Loyverse falla, no se hace rollback local. Se retorna status `207 Multi-Status` con `loyverse_sync: false` y advertencia.
- **`UpdateProductCommandHandler`**:
  Actualiza los campos provistos en Supabase. Si cambian `nombre`, `precio` o `costo`, invoca `PUT /items/:id` en Loyverse.
- **`DeactivateProductCommandHandler`**:
  Ejecuta **baja lógica** (`update productos set activo = false`). Nunca borra físicamente el registro para mantener integridad histórica.

### Queries (Lecturas)
- **`GetProductsQuery`**: `{ categoria, activo }`
- **`GetProductByIdQuery`**: `{ id }`

### Query Handlers
- **`GetProductsQueryHandler`**:
  Consulta `productos` filtrando por categoría o estado activo, ordenado por `categoria asc, nombre asc`.
- **`GetProductByIdQueryHandler`**:
  Consulta un producto específico por ID.

---

## 3. Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/productos` | Sí | Listar productos (`?categoria=...&activo=false|all`) |
| `GET` | `/api/productos/:id` | Sí | Obtener producto por ID |
| `POST` | `/api/productos` | Sí | Crear producto en Supabase + espejo Loyverse |
| `PUT` | `/api/productos/:id` | Sí | Actualizar producto |
| `DELETE` | `/api/productos/:id` | Sí | Desactivar producto (baja lógica) |
