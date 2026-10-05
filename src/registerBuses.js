const commandBus = require('./core/bus/commandBus');
const queryBus = require('./core/bus/queryBus');

// ── Auth ────────────────────────────────────────────────────────────
const LoginCommand = require('./modules/auth/commands/LoginCommand');
const LoginCommandHandler = require('./modules/auth/commands/handlers/LoginCommandHandler');

// ── Productos ───────────────────────────────────────────────────────
const CreateProductCommand = require('./modules/productos/commands/CreateProductCommand');
const UpdateProductCommand = require('./modules/productos/commands/UpdateProductCommand');
const DeactivateProductCommand = require('./modules/productos/commands/DeactivateProductCommand');
const CreateProductCommandHandler = require('./modules/productos/commands/handlers/CreateProductCommandHandler');
const UpdateProductCommandHandler = require('./modules/productos/commands/handlers/UpdateProductCommandHandler');
const DeactivateProductCommandHandler = require('./modules/productos/commands/handlers/DeactivateProductCommandHandler');

const GetProductsQuery = require('./modules/productos/queries/GetProductsQuery');
const GetProductByIdQuery = require('./modules/productos/queries/GetProductByIdQuery');
const GetProductsQueryHandler = require('./modules/productos/queries/handlers/GetProductsQueryHandler');
const GetProductByIdQueryHandler = require('./modules/productos/queries/handlers/GetProductByIdQueryHandler');

// ── Descuentos ──────────────────────────────────────────────────────
const CreateDiscountCommand = require('./modules/descuentos/commands/CreateDiscountCommand');
const UpdateDiscountCommand = require('./modules/descuentos/commands/UpdateDiscountCommand');
const DeleteDiscountCommand = require('./modules/descuentos/commands/DeleteDiscountCommand');
const CreateDiscountCommandHandler = require('./modules/descuentos/commands/handlers/CreateDiscountCommandHandler');
const UpdateDiscountCommandHandler = require('./modules/descuentos/commands/handlers/UpdateDiscountCommandHandler');
const DeleteDiscountCommandHandler = require('./modules/descuentos/commands/handlers/DeleteDiscountCommandHandler');

const GetDiscountsQuery = require('./modules/descuentos/queries/GetDiscountsQuery');
const GetDiscountByIdQuery = require('./modules/descuentos/queries/GetDiscountByIdQuery');
const GetDiscountsQueryHandler = require('./modules/descuentos/queries/handlers/GetDiscountsQueryHandler');
const GetDiscountByIdQueryHandler = require('./modules/descuentos/queries/handlers/GetDiscountByIdQueryHandler');

// ── Ventas ──────────────────────────────────────────────────────────
const GetReceiptsQuery = require('./modules/ventas/queries/GetReceiptsQuery');
const GetSalesSummaryQuery = require('./modules/ventas/queries/GetSalesSummaryQuery');
const GetReceiptsQueryHandler = require('./modules/ventas/queries/handlers/GetReceiptsQueryHandler');
const GetSalesSummaryQueryHandler = require('./modules/ventas/queries/handlers/GetSalesSummaryQueryHandler');

// ── Cupones y Clientes ──────────────────────────────────────────────
const GetCouponsQuery = require('./modules/cupones/queries/GetCouponsQuery');
const GetClientStatsQuery = require('./modules/cupones/queries/GetClientStatsQuery');
const GetCouponsQueryHandler = require('./modules/cupones/queries/handlers/GetCouponsQueryHandler');
const GetClientStatsQueryHandler = require('./modules/cupones/queries/handlers/GetClientStatsQueryHandler');

// ── Estadísticas ────────────────────────────────────────────────────
const GetTopProductsBySegmentQuery = require('./modules/estadisticas/queries/GetTopProductsBySegmentQuery');
const GetProductAffinityQuery = require('./modules/estadisticas/queries/GetProductAffinityQuery');
const GetTopProductsBySegmentQueryHandler = require('./modules/estadisticas/queries/handlers/GetTopProductsBySegmentQueryHandler');
const GetProductAffinityQueryHandler = require('./modules/estadisticas/queries/handlers/GetProductAffinityQueryHandler');

function registerBuses() {
  // Command Handlers
  commandBus.register(LoginCommand, new LoginCommandHandler());
  commandBus.register(CreateProductCommand, new CreateProductCommandHandler());
  commandBus.register(UpdateProductCommand, new UpdateProductCommandHandler());
  commandBus.register(DeactivateProductCommand, new DeactivateProductCommandHandler());
  commandBus.register(CreateDiscountCommand, new CreateDiscountCommandHandler());
  commandBus.register(UpdateDiscountCommand, new UpdateDiscountCommandHandler());
  commandBus.register(DeleteDiscountCommand, new DeleteDiscountCommandHandler());

  // Query Handlers
  queryBus.register(GetProductsQuery, new GetProductsQueryHandler());
  queryBus.register(GetProductByIdQuery, new GetProductByIdQueryHandler());
  queryBus.register(GetDiscountsQuery, new GetDiscountsQueryHandler());
  queryBus.register(GetDiscountByIdQuery, new GetDiscountByIdQueryHandler());
  queryBus.register(GetReceiptsQuery, new GetReceiptsQueryHandler());
  queryBus.register(GetSalesSummaryQuery, new GetSalesSummaryQueryHandler());
  queryBus.register(GetCouponsQuery, new GetCouponsQueryHandler());
  queryBus.register(GetClientStatsQuery, new GetClientStatsQueryHandler());
  queryBus.register(GetTopProductsBySegmentQuery, new GetTopProductsBySegmentQueryHandler());
  queryBus.register(GetProductAffinityQuery, new GetProductAffinityQueryHandler());

  console.log('✅ [CQRS] CommandBus y QueryBus registrados exitosamente.');
}

module.exports = registerBuses;
