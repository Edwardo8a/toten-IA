const queryBus = require('../../src/core/bus/queryBus');

class DummyQuery {
  constructor(term) {
    this.term = term;
  }
}

class DummyQueryHandler {
  async execute(query) {
    return { data: `Found for ${query.term}` };
  }
}

describe('CQRS QueryBus Unit Tests', () => {
  beforeEach(() => {
    queryBus.clear();
  });

  test('Debe registrar y ejecutar una consulta correctamente', async () => {
    queryBus.register(DummyQuery, new DummyQueryHandler());
    const result = await queryBus.execute(new DummyQuery('cafe'));
    expect(result).toEqual({ data: 'Found for cafe' });
  });

  test('Debe lanzar error si se ejecuta una query sin handler registrado', async () => {
    class UnknownQuery {}
    await expect(queryBus.execute(new UnknownQuery())).rejects.toThrow(
      'No existe un QueryHandler registrado para: [UnknownQuery]'
    );
  });
});
