import type { InputAction, InputEvent, Unsubscribe } from "./types.js";
import { createInputRouter } from "./router.js";

export type InputAdapter = {
  id: string;
  isAvailable(): boolean;
  start(): void;
  stop(): void;
};

export type InputManager = {
  router: ReturnType<typeof createInputRouter>;
  start(): void;
  stop(): void;
  addAdapter(adapter: InputAdapter): void;
  removeAdapter(id: string): void;
  getAdapter(id: string): InputAdapter | null;
  listAdapters(): InputAdapter[];
  registerAction(action: InputAction): void;
  getAction(id: string): InputAction | null;
  listActions(): InputAction[];
  onAction(handler: (event: InputEvent, action: InputAction) => void): Unsubscribe;
  emit(event: InputEvent): void;
  getEventHandler(): (event: InputEvent) => void;
};

export type InputManagerOptions = {
  router?: ReturnType<typeof createInputRouter>;
  adapters?: InputAdapter[];
};

export function createInputManager(options: InputManagerOptions = {}): InputManager {
  const router = options.router ?? createInputRouter();
  const adapters = new Map<string, InputAdapter>();

  if (options.adapters) {
    for (const adapter of options.adapters) {
      adapters.set(adapter.id, adapter);
    }
  }

  const emit = (event: InputEvent) => {
    router.emit(event);
  };

  return {
    router,
    start() {
      for (const adapter of adapters.values()) {
        if (adapter.isAvailable()) {
          adapter.start();
        }
      }
    },
    stop() {
      for (const adapter of adapters.values()) {
        adapter.stop();
      }
    },
    addAdapter(adapter) {
      const existing = adapters.get(adapter.id);
      if (existing) {
        existing.stop();
      }
      adapters.set(adapter.id, adapter);
    },
    removeAdapter(id) {
      const adapter = adapters.get(id);
      if (!adapter) {
        return;
      }
      adapter.stop();
      adapters.delete(id);
    },
    getAdapter(id) {
      return adapters.get(id) ?? null;
    },
    listAdapters() {
      return Array.from(adapters.values());
    },
    registerAction(action) {
      router.registerAction(action);
    },
    getAction(id) {
      return router.getAction(id);
    },
    listActions() {
      return router.listActions();
    },
    onAction(handler) {
      return router.onAction(handler);
    },
    emit,
    getEventHandler() {
      return emit;
    }
  };
}
