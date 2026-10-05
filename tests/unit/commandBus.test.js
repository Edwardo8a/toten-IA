const commandBus = require('../../src/core/bus/commandBus');

class DummyCommand {
  constructor(value) {
    this.value = value;
  }
}

class DummyCommandHandler {
  async execute(command) {
    return { result: command.value * 2 };
  }
}

describe('CQRS CommandBus Unit Tests', () => {
  beforeEach(() => {
    commandBus.clear();
  });

  test('Debe registrar y despachar un comando correctamente', async () => {
    commandBus.register(DummyCommand, new DummyCommandHandler());
    const result = await commandBus.dispatch(new DummyCommand(21));
    expect(result).toEqual({ result: 42 });
  });

  test('Debe lanzar error si se despacha un comando sin handler registrado', async () => {
    class UnregisteredCommand {}
    await expect(commandBus.dispatch(new UnregisteredCommand())).rejects.toThrow(
      'No existe un CommandHandler registrado para: [UnregisteredCommand]'
    );
  });

  test('Debe lanzar error si el handler no implementa el método execute', () => {
    expect(() => {
      commandBus.register('InvalidCommand', {});
    }).toThrow('Handler para [InvalidCommand] debe implementar el método execute(command).');
  });
});
