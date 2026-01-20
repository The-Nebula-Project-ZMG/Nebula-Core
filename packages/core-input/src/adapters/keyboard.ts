import type { InputEvent, InputEventPhase } from "../types.js";

export type KeyboardBindings = Record<string, string>;

export type KeyboardAdapterOptions = {
  bindings: KeyboardBindings;
  onEvent: (event: InputEvent) => void;
  target?: Window | Document | HTMLElement;
  preventDefault?: boolean;
  allowRepeat?: boolean;
};

export type KeyboardAdapter = {
  id: "keyboard";
  isAvailable(): boolean;
  start(): void;
  stop(): void;
  updateBindings(bindings: KeyboardBindings): void;
  getBindings(): KeyboardBindings;
};

export function createKeyboardAdapter(options: KeyboardAdapterOptions): KeyboardAdapter {
  let bindings: KeyboardBindings = { ...options.bindings };
  const target = options.target ?? (typeof window !== "undefined" ? window : undefined);
  let isActive = false;

  const getTimestamp = (event: KeyboardEvent) =>
    typeof event.timeStamp === "number" ? event.timeStamp : Date.now();

  const resolveActionId = (event: KeyboardEvent) =>
    bindings[event.code] ?? bindings[event.key] ?? null;

  const emit = (event: KeyboardEvent, phase: InputEventPhase) => {
    const actionId = resolveActionId(event);
    if (!actionId) {
      return;
    }

    if (options.preventDefault) {
      event.preventDefault();
    }

    options.onEvent({
      deviceType: "keyboard",
      actionId,
      phase,
      timestamp: getTimestamp(event),
      raw: event
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!options.allowRepeat && event.repeat) {
      return;
    }

    emit(event, event.repeat ? "repeat" : "pressed");
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    emit(event, "released");
  };

  const start = () => {
    if (!target || isActive) {
      return;
    }

    target.addEventListener("keydown", handleKeyDown as EventListener);
    target.addEventListener("keyup", handleKeyUp as EventListener);
    isActive = true;
  };

  const stop = () => {
    if (!target || !isActive) {
      return;
    }

    target.removeEventListener("keydown", handleKeyDown as EventListener);
    target.removeEventListener("keyup", handleKeyUp as EventListener);
    isActive = false;
  };

  return {
    id: "keyboard",
    isAvailable() {
      return Boolean(target);
    },
    start,
    stop,
    updateBindings(nextBindings) {
      bindings = { ...nextBindings };
    },
    getBindings() {
      return { ...bindings };
    }
  };
}
