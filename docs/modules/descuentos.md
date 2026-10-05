# Módulo de Ofertas y Descuentos (`descuentos`)

## 1. Propósito
Permitir al administrador crear, modificar y apagar ofertas y promociones directamente desde el dashboard web sin tener que entrar al Back Office de Loyverse. En este caso, **Loyverse es la única fuente de verdad** (no se duplica en Supabase).

---

## 2. Implementación CQRS

### Commands
- **`CreateDiscountCommand`**: `{ nombre, tipo, valor, tiendas }`
- **`UpdateDiscountCommand`**: `{ id, nombre, tipo, valor, tiendas }`
- **`DeleteDiscountCommand`**: `{ id }`

### Command Handlers
- **`CreateDiscountCommandHandler`**:
  - Valida el tipo (`FIXED_PERCENT` o `FIXED_AMOUNT`).
  - Si no se suministra el arreglo de tiendas (`tiendas`), consulta automáticamente `GET /stores` en Loyverse y asocia el descuento a todas las sucursales de la cuenta.
  - Envía la petición a `POST /discounts` en Loyverse y registra el log de payload y respuesta.
- **`UpdateDiscountCommandHandler`**:
  - Actualiza el descuento mediante `PUT /discounts/:id`.
- **`DeleteDiscountCommandHandler`**:
  - Elimina el descuento en Loyverse vía `DELETE /discounts/:id`.

### Queries
- **`GetDiscountsQuery`**: Consulta todos los descuentos en Loyverse.
- **`GetDiscountByIdQuery`**: Consulta un descuento por ID.

### Query Handlers
- **`GetDiscountsQueryHandler`**: Llama a `GET /discounts`.
- **`GetDiscountByIdQueryHandler`**: Llama a `GET /discounts/:id`.

---

## 3. Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/descuentos` | Sí | Listar descuentos de Loyverse |
| `GET` | `/api/descuentos/:id` | Sí | Ver descuento por ID |
| `POST` | `/api/descuentos` | Sí | Crear nuevo descuento en Loyverse |
| `PUT` | `/api/descuentos/:id` | Sí | Actualizar descuento en Loyverse |
| `DELETE` | `/api/descuentos/:id` | Sí | Eliminar descuento en Loyverse |

### Ejemplo Body Creación de Descuento:
```json
{
  "nombre": "Promo Tótem 15%",
  "tipo": "FIXED_PERCENT",
  "valor": 15
}
```
*(Aplica automáticamente a todas las sucursales si no se envían `tiendas`).*
