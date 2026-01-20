import type { InputEvent, InputEventPhase } from "../types.js";

export type MouseBindings = {
  buttons?: Record<number, string>;
  wheel?: string;
  move?: string;
};

export type MouseAdapterOptions = {
  bindings: MouseBindings;
  onEvent: (event: InputEvent) => void;
  target?: Window | Document | HTMLElement;
  preventDefault?: boolean;
};

export type MouseAdapter = {
  id: "mouse";
  isAvailable(): boolean;
  start(): void;
  stop(): void;
  updateBindings(bindings: MouseBindings): void;
  getBindings(): MouseBindings;
};

export function createMouseAdapter(options: MouseAdapterOptions): MouseAdapter {
  let bindings: MouseBindings = {
    buttons: { ...options.bindings.buttons },
    wheel: options.bindings.wheel,
    move: options.bindings.move
  };
  const target = options.target ?? (typeof window !== "undefined" ? window : undefined);
  let isActive = false;

  const getTimestamp = (event: Event) =>
    typeof event.timeStamp === "number" ? event.timeStamp : Date.now();

  const emit = (event: Event, phase: InputEventPhase, actionId: string | null, value?: number) => {
    if (!actionId) {
      return;
    }

    if (options.preventDefault && event.cancelable) {
      event.preventDefault();
    }

    options.onEvent({
      deviceType: "mouse",
      actionId,
      phase,
      timestamp: getTimestamp(event),
      value,
      raw: event
    });
  };

  const handleMouseDown = (event: MouseEvent) => {
    const actionId = bindings.buttons?.[event.button] ?? null;
    emit(event, "pressed", actionId);
  };

  const handleMouseUp = (event: MouseEvent) => {
    const actionId = bindings.buttons?.[event.button] ?? null;
    emit(event, "released", actionId);
  };

  const handleWheel = (event: WheelEvent) => {
    const actionId = bindings.wheel ?? null;
    emit(event, "axis", actionId, event.deltaY);
  };

  const handleMove = (event: MouseEvent) => {
    const actionId = bindings.move ?? null;
    const value = Math.hypot(event.movementX ?? 0, event.movementY ?? 0);
    emit(event, "axis", actionId, value);
  };

  const start = () => {
    if (!target || isActive) {
      return;
    }

    target.addEventListener("mousedown", handleMouseDown as EventListener);
    target.addEventListener("mouseup", handleMouseUp as EventListener);
    target.addEventListener("wheel", handleWheel as EventListener, { passive: !options.preventDefault });
    target.addEventListener("mousemove", handleMove as EventListener);
    isActive = true;
  };

  const stop = () => {
    if (!target || !isActive) {
      return;
    }

    target.removeEventListener("mousedown", handleMouseDown as EventListener);
    target.removeEventListener("mouseup", handleMouseUp as EventListener);
    target.removeEventListener("wheel", handleWheel as EventListener);
    target.removeEventListener("mousemove", handleMove as EventListener);
    isActive = false;
  };

  return {
    id: "mouse",
    isAvailable() {
      return Boolean(target);
    },
    start,
    stop,
    updateBindings(nextBindings) {
      bindings = {
        buttons: { ...nextBindings.buttons },
        wheel: nextBindings.wheel,
        move: nextBindings.move
      };
    },
    getBindings() {
      return {
        buttons: { ...bindings.buttons },
        wheel: bindings.wheel,
        move: bindings.move
      };
    }
  };
}
