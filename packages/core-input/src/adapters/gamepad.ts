import type { InputEvent, InputEventPhase } from "../types.js";

export type GamepadBindings = {
  buttons?: Record<number, string>;
  axes?: Record<number, string>;
};

export type GamepadAdapterOptions = {
  bindings: GamepadBindings;
  onEvent: (event: InputEvent) => void;
  deadzone?: number;
  pollIntervalMs?: number;
};

export type GamepadAdapter = {
  id: "gamepad";
  isAvailable(): boolean;
  start(): void;
  stop(): void;
  updateBindings(bindings: GamepadBindings): void;
  getBindings(): GamepadBindings;
};

type GamepadState = {
  buttons: boolean[];
  axes: number[];
};

export function createGamepadAdapter(options: GamepadAdapterOptions): GamepadAdapter {
  let bindings: GamepadBindings = {
    buttons: { ...options.bindings.buttons },
    axes: { ...options.bindings.axes }
  };
  const deadzone = options.deadzone ?? 0.15;
  const pollIntervalMs = options.pollIntervalMs ?? 0;
  const stateByIndex = new Map<number, GamepadState>();
  let rafId: number | null = null;
  let intervalId: number | null = null;
  let isActive = false;

  const isAvailable = () =>
    typeof navigator !== "undefined" && typeof navigator.getGamepads === "function";

  const getTimestamp = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  const emit = (phase: InputEventPhase, actionId: string | null, value?: number, raw?: unknown) => {
    if (!actionId) {
      return;
    }

    options.onEvent({
      deviceType: "gamepad",
      actionId,
      phase,
      timestamp: getTimestamp(),
      value,
      raw
    });
  };

  const poll = () => {
    if (!isAvailable()) {
      return;
    }

    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue;
      }

      const previous = stateByIndex.get(gamepad.index) ?? {
        buttons: new Array(gamepad.buttons.length).fill(false),
        axes: new Array(gamepad.axes.length).fill(0)
      };

      const nextButtons = gamepad.buttons.map((button) => button.pressed);
      const nextAxes = gamepad.axes.slice();

      if (bindings.buttons) {
        for (const [indexKey, actionId] of Object.entries(bindings.buttons)) {
          const index = Number(indexKey);
          const nextPressed = Boolean(nextButtons[index]);
          const prevPressed = Boolean(previous.buttons[index]);
          if (nextPressed !== prevPressed) {
            emit(nextPressed ? "pressed" : "released", actionId, nextPressed ? 1 : 0, {
              gamepad,
              kind: "button",
              index
            });
          }
        }
      }

      if (bindings.axes) {
        for (const [indexKey, actionId] of Object.entries(bindings.axes)) {
          const index = Number(indexKey);
          const value = Number(nextAxes[index] ?? 0);
          const filteredValue = Math.abs(value) < deadzone ? 0 : value;
          if (filteredValue !== 0) {
            emit("axis", actionId, filteredValue, {
              gamepad,
              kind: "axis",
              index
            });
          }
        }
      }

      stateByIndex.set(gamepad.index, {
        buttons: nextButtons,
        axes: nextAxes
      });
    }
  };

  const tick = () => {
    poll();
    if (isActive && pollIntervalMs === 0) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const start = () => {
    if (!isAvailable() || isActive) {
      return;
    }

    isActive = true;
    if (pollIntervalMs > 0) {
      intervalId = window.setInterval(poll, pollIntervalMs);
    } else {
      rafId = requestAnimationFrame(tick);
    }
  };

  const stop = () => {
    if (!isActive) {
      return;
    }

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    isActive = false;
  };

  return {
    id: "gamepad",
    isAvailable,
    start,
    stop,
    updateBindings(nextBindings) {
      bindings = {
        buttons: { ...nextBindings.buttons },
        axes: { ...nextBindings.axes }
      };
    },
    getBindings() {
      return {
        buttons: { ...bindings.buttons },
        axes: { ...bindings.axes }
      };
    }
  };
}
