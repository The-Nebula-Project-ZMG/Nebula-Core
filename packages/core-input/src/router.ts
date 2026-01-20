import type {
  InputAction,
  InputActionRegistry,
  InputEvent,
  Unsubscribe
} from "./types.js";

export function createInputActionRegistry(): InputActionRegistry {
  const actions = new Map<string, InputAction>();

  return {
    register(action: InputAction) {
      actions.set(action.id, action);
    },
    get(id: string) {
      return actions.get(id) ?? null;
    },
    list() {
      return Array.from(actions.values());
    }
  };
}

export type InputRouter = {
  registerAction(action: InputAction): void;
  getAction(id: string): InputAction | null;
  listActions(): InputAction[];
  onAction(handler: (event: InputEvent, action: InputAction) => void): Unsubscribe;
  emit(event: InputEvent): void;
};

export type InputRouterOptions = {
  registry?: InputActionRegistry;
};

export function createInputRouter(options: InputRouterOptions = {}): InputRouter {
  const registry = options.registry ?? createInputActionRegistry();
  const listeners = new Set<(event: InputEvent, action: InputAction) => void>();

  return {
    registerAction(action) {
      registry.register(action);
    },
    getAction(id) {
      return registry.get(id);
    },
    listActions() {
      return registry.list();
    },
    onAction(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    emit(event) {
      const action = registry.get(event.actionId);
      if (!action) {
        return;
      }

      for (const handler of listeners) {
        handler(event, action);
      }
    }
  };
}
