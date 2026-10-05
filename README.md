# ☕ Backend Café Lobo — Tótem Hackathon (Arquitectura CQRS Pura)

Servicio backend propio para el ecosistema de **Café Lobo**, diseñado para desacoplar el dashboard web de administración de los flujos de n8n, interactuando directamente con **Supabase** y la API oficial de **Loyverse** bajo una **arquitectura CQRS pura (Command Query Responsibility Segregation)**.

Ubicación del proyecto: `D:\proyectos\hackaton`

---

## 🏛️ 1. Arquitectura CQRS Pura

El sistema implementa una separación formal entre operaciones que **mutan el estado** (**Commands**) y operaciones que **leen datos** (**Queries**), coordinadas a través de buses de mediación desacoplados:

```
                      ┌──────────────────────────────────────────────┐
                      │            Controladores HTTP / API          │
                      └──────────────┬───────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
      ┌─────────────────────┐                 ┌─────────────────────┐
      │    ⚡ CommandBus     │                 │     🔍 QueryBus     │
      └──────────┬──────────┘                 └──────────┬──────────┘
                 │                                       │
                 ▼                                       ▼
     ┌──────────────────────┐                ┌──────────────────────┐
     │   Command Handlers   │                │    Query Handlers    │
     │     (Mutaciones)     │                │      (Lecturas)      │
     └──────────┬───────────┘                └──────────┬───────────┘
                │                                       │
     ┌──────────┴───────────┐                ┌──────────┴───────────┐
     ▼                      ▼                ▼                      ▼
┌─────────┐            ┌──────────┐    ┌─────────┐            ┌──────────┐
│Supabase │            │ Loyverse │    │Supabase │            │ Loyverse │
│(Write)  │            │  (Write) │    │ (Read)  │            │  (Read)  │
└─────────┘            └──────────┘    └─────────┘            └──────────┘
```

- **Commands:** `LoginCommand`, `CreateProductCommand`, `UpdateProductCommand`, `DeactivateProductCommand`, `CreateDiscountCommand`, `UpdateDiscountCommand`, `DeleteDiscountCommand`.
- **Queries:** `GetProductsQuery`, `GetProductByIdQuery`, `GetDiscountsQuery`, `GetDiscountByIdQuery`, `GetReceiptsQuery`, `GetSalesSummaryQuery`, `GetCouponsQuery`, `GetClientStatsQuery`, `GetTopProductsBySegmentQuery`, `GetProductAffinityQuery`.
- **Manejo asimétrico de fallos:** Si Loyverse experimenta intermitencia al crear o editar un producto, la transacción local en Supabase persiste y se notifica al frontend con código HTTP `207 Multi-Status` (`loyverse_sync: false`).

---

## 📁 2. Estructura del Directorio

```
D:\proyectos\hackaton/
├── src/
│   ├── config/               # Clientes (Supabase, Loyverse fetch nativo, JWT, Env)
│   ├── core/
│   │   ├── bus/
│   │   │   ├── commandBus.js # Bus mediador de comandos con middlewares
│   │   │   └── queryBus.js   # Bus mediador de consultas de solo lectura
│   │   └── errors/           # AppError, ValidationError
│   ├── middlewares/          # requireAuth (JWT), errorHandler
│   ├── modules/              # Módulos CQRS independientes
│   │   ├── auth/             # LoginCommand, LoginCommandHandler, auth.routes.js
│   │   ├── productos/        # Commands, Queries, Handlers, productos.routes.js
│   │   ├── descuentos/       # Commands, Queries, Handlers, descuentos.routes.js
│   │   ├── ventas/           # Queries, Handlers, ventas.routes.js
│   │   ├── cupones/          # Queries, Handlers, cupones.routes.js
│   │   └── estadisticas/     # Queries, Handlers (Nivel 1 y 2), estadisticas.routes.js
│   ├── utils/                # slugify.js
│   ├── registerBuses.js      # Registro e inyección de todos los handlers a los buses
│   └── app.js                # Instancia y configuración de Express
├── tests/                    # Suite de pruebas automatizadas con Jest
│   ├── unit/                 # Pruebas unitarias de CommandBus, QueryBus, slugify, JWT
│   └── integration/          # Pruebas de integración de auth, salud, seguridad y Loyverse
├── docs/                     # Documentación técnica completa
│   ├── cqrs-architecture.md  # Detalle de diseño CQRS y flujo de ejecución
│   ├── modules/              # Explicación módulo por módulo
│   │   ├── auth.md
│   │   ├── productos.md
│   │   ├── descuentos.md
│   │   ├── ventas.md
│   │   ├── cupones.md
│   │   └── estadisticas.md
│   └── frontend-integration/ # Ejemplos completos de código para clientes
│       ├── web-react.md
│       ├── web-vanilla-html-js.md
│       ├── flutter.md
│       └── kotlin-android.md
├── workflows/                # Workflows de respaldo y orquestación n8n
│   ├── Totem_Hackathon_ORQUESTADOR_v2.json
│   ├── Totem_Hackathon_LOYVERSE_Canje_v1.json
│   ├── Totem_Hackathon_PRODUCTOS_v1.json
│   └── loyverse_crear_descuento.py
├── scripts/
│   └── generateHash.js       # Generador de hashes bcrypt para administradores
├── .env                      # Variables de entorno activas
├── .env.example              # Plantilla de variables de entorno
├── jest.config.js            # Configuración de pruebas Jest
├── package.json
└── server.js                 # Punto de entrada HTTP
```

---

## ⚡ 3. Inicio Rápido

### Requisitos
- **Node.js 22+** (usa el cliente `fetch` nativo)
- **npm 8+**

### Instalación de dependencias
```bash
cd D:\proyectos\hackaton
npm install
```

### Ejecutar Pruebas Automatizadas (Jest)
Todas las pruebas unitarias y de integración corren con:
```bash
npm test
```
*Resultado actual: 8 test suites aprobadas, 29 pruebas pasadas al 100%.*

### Generar Hash para Contraseña de Administrador
```bash
npm run hash-password miContrasenaSecreta
```
Copia el hash impreso y colócalo en `ADMIN_PASSWORD_HASH` dentro de tu `.env`.

### Iniciar Servidor
- **Desarrollo (con auto-reload de Node 22):**
  ```bash
  npm run dev
  ```
- **Producción:**
  ```bash
  npm start
  ```
El servidor escuchará en: `http://localhost:4000`  
Healthcheck: `http://localhost:4000/api/health`

---

## 📖 4. Resumen de la REST API

Todas las rutas requieren header `Authorization: Bearer <TOKEN>` salvo `/api/auth/login` y `/api/health`.

| Módulo | Método | Endpoint | CQRS Interno |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Consulta directa de estado |
| **Auth** | `POST` | `/api/auth/login` | `LoginCommand` |
| **Auth** | `GET` | `/api/auth/me` | Validación de token JWT |
| **Productos** | `GET` | `/api/productos` | `GetProductsQuery` |
| **Productos** | `GET` | `/api/productos/:id` | `GetProductByIdQuery` |
| **Productos** | `POST` | `/api/productos` | `CreateProductCommand` |
| **Productos** | `PUT` | `/api/productos/:id` | `UpdateProductCommand` |
| **Productos** | `DELETE` | `/api/productos/:id` | `DeactivateProductCommand` (Baja lógica) |
| **Descuentos** | `GET` | `/api/descuentos` | `GetDiscountsQuery` |
| **Descuentos** | `GET` | `/api/descuentos/:id` | `GetDiscountByIdQuery` |
| **Descuentos** | `POST` | `/api/descuentos` | `CreateDiscountCommand` |
| **Descuentos** | `PUT` | `/api/descuentos/:id` | `UpdateDiscountCommand` |
| **Descuentos** | `DELETE` | `/api/descuentos/:id` | `DeleteDiscountCommand` |
| **Ventas** | `GET` | `/api/ventas` | `GetReceiptsQuery` |
| **Ventas** | `GET` | `/api/ventas/resumen` | `GetSalesSummaryQuery` |
| **Cupones** | `GET` | `/api/cupones` | `GetCouponsQuery` |
| **Clientes** | `GET` | `/api/clientes/stats` | `GetClientStatsQuery` |
| **Estadísticas** | `GET` | `/api/estadisticas/top-productos` | `GetTopProductsBySegmentQuery` (Nivel 1) |
| **Estadísticas** | `GET` | `/api/estadisticas/afinidad` | `GetProductAffinityQuery` (Nivel 2) |

---

## 📚 5. Documentación Adicional

- [Arquitectura CQRS Detallada](file:///D:/proyectos/hackaton/docs/cqrs-architecture.md)
- [Módulo Auth](file:///D:/proyectos/hackaton/docs/modules/auth.md)
- [Módulo Productos](file:///D:/proyectos/hackaton/docs/modules/productos.md)
- [Módulo Descuentos](file:///D:/proyectos/hackaton/docs/modules/descuentos.md)
- [Módulo Ventas](file:///D:/proyectos/hackaton/docs/modules/ventas.md)
- [Módulo Cupones y Clientes](file:///D:/proyectos/hackaton/docs/modules/cupones.md)
- [Módulo Estadísticas y Afinidad](file:///D:/proyectos/hackaton/docs/modules/estadisticas.md)
- **Guías de Integración Frontend:**
  - [Web: React + TypeScript](file:///D:/proyectos/hackaton/docs/frontend-integration/web-react.md)
  - [Web: Vanilla HTML + JS](file:///D:/proyectos/hackaton/docs/frontend-integration/web-vanilla-html-js.md)
  - [Mobile / Quiosco: Flutter (Dart)](file:///D:/proyectos/hackaton/docs/frontend-integration/flutter.md)
  - [Mobile / Android: Kotlin (Jetpack Compose)](file:///D:/proyectos/hackaton/docs/frontend-integration/kotlin-android.md)
