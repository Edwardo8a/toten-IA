class CreateDiscountCommand {
  constructor(payload = {}) {
    this.nombre = payload.nombre || payload.name;
    this.tipo = payload.tipo || payload.type;
    this.valor = payload.valor ?? payload.discount_percent ?? payload.discount_amount;
    this.tiendas = payload.tiendas || payload.stores;
  }
}

module.exports = CreateDiscountCommand;
