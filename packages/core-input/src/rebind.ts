import type { InputDeviceType, InputEvent } from "./types.js";
import type { KeyboardBindings } from "./adapters/keyboard.js";
import type { MouseBindings } from "./adapters/mouse.js";
import type { GamepadBindings } from "./adapters/gamepad.js";
import type { TouchBindings } from "./adapters/touch.js";

export type RebindTarget =
  | {
      deviceType: "keyboard";
      getBindings(): KeyboardBindings;
      updateBindings(bindings: KeyboardBindings): void;
    }
  | {
      deviceType: "mouse";
      getBindings(): MouseBindings;
      updateBindings(bindings: MouseBindings): void;
    }
  | {
      deviceType: "gamepad";
      getBindings(): GamepadBindings;
      updateBindings(bindings: GamepadBindings): void;
    }
  | {
      deviceType: "touch";
      getBindings(): TouchBindings;
      updateBindings(bindings: TouchBindings): void;
    };

export type InputRebinder = {
  handleEvent(event: InputEvent): void;
  captureNext(actionId: string, deviceType?: InputDeviceType, timeoutMs?: number): Promise<InputEvent>;
  cancel(): void;
};

type PendingCapture = {
  actionId: string;
  deviceType?: InputDeviceType;
  resolve: (event: InputEvent) => void;
  reject: (error: Error) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
};

export type InputRebinderOptions = {
  onEvent: (event: InputEvent) => void;
  targets: RebindTarget[];
};

export function createInputRebinder(options: InputRebinderOptions): InputRebinder {
  let pending: PendingCapture | null = null;

  const applyRebind = (event: InputEvent, actionId: string) => {
    const target = options.targets.find((entry) => entry.deviceType === event.deviceType);
    if (!target) {
      return false;
    }

    switch (event.deviceType) {
      case "keyboard": {
        const raw = event.raw as KeyboardEvent | undefined;
        const key = raw?.code ?? raw?.key;
        if (!key) {
          return false;
        }
        const bindings = (target as any).getBindings() as KeyboardBindings;
        (target as any).updateBindings({
          ...bindings,
          [key]: actionId
        } as KeyboardBindings);
        return true;
      }
      case "mouse": {
        const raw = event.raw as MouseEvent | WheelEvent | undefined;
        if (!raw) {
          return false;
        }
        const bindings = (target as any).getBindings() as MouseBindings;
        if (raw.type === "wheel") {
          (target as any).updateBindings({
            ...bindings,
            wheel: actionId
          } as MouseBindings);
          return true;
        }
        if (raw.type === "mousemove") {
          (target as any).updateBindings({
            ...bindings,
            move: actionId
          } as MouseBindings);
          return true;
        }
        if ("button" in raw) {
          const nextButtons = { ...(bindings.buttons ?? {}) };
          nextButtons[raw.button] = actionId;
          (target as any).updateBindings({
            ...bindings,
            buttons: nextButtons
          } as MouseBindings);
          return true;
        }
        return false;
      }
      case "gamepad": {
        const raw = event.raw as { kind?: "button" | "axis"; index?: number } | undefined;
        if (!raw || typeof raw.index !== "number") {
          return false;
        }
        const bindings = (target as any).getBindings() as GamepadBindings;
        if (raw.kind === "axis") {
          const nextAxes = { ...(bindings.axes ?? {}) };
          nextAxes[raw.index] = actionId;
          (target as any).updateBindings({
            ...bindings,
            axes: nextAxes
          } as GamepadBindings);
          return true;
        }
        const nextButtons = { ...(bindings.buttons ?? {}) };
        nextButtons[raw.index] = actionId;
        (target as any).updateBindings({
          ...bindings,
          buttons: nextButtons
        } as GamepadBindings);
        return true;
      }
      case "touch": {
        const raw = event.raw as { gesture?: string } | undefined;
        if (!raw?.gesture) {
          return false;
        }
        const bindings = (target as any).getBindings() as TouchBindings;
        if (raw.gesture === "tap") {
          (target as any).updateBindings({ ...bindings, tap: actionId } as TouchBindings);
          return true;
        }
        if (raw.gesture === "longPress") {
          (target as any).updateBindings({ ...bindings, longPress: actionId } as TouchBindings);
          return true;
        }
        if (raw.gesture === "swipe") {
          (target as any).updateBindings({ ...bindings, swipe: actionId } as TouchBindings);
          return true;
        }
        if (raw.gesture === "pinch") {
          (target as any).updateBindings({ ...bindings, pinch: actionId } as TouchBindings);
          return true;
        }
        if (raw.gesture === "move") {
          (target as any).updateBindings({ ...bindings, move: actionId } as TouchBindings);
          return true;
        }
        return false;
      }
      default:
        return false;
    }
  };

  const resetPending = () => {
    if (pending?.timeoutId) {
      clearTimeout(pending.timeoutId);
    }
    pending = null;
  };

  return {
    handleEvent(event) {
      options.onEvent(event);

      if (!pending) {
        return;
      }

      if (pending.deviceType && pending.deviceType !== event.deviceType) {
        return;
      }

      const applied = applyRebind(event, pending.actionId);
      if (!applied) {
        return;
      }

      const resolved = pending;
      resetPending();
      resolved.resolve(event);
    },
    captureNext(actionId, deviceType, timeoutMs) {
      if (pending) {
        pending.reject(new Error("Rebind already in progress."));
        resetPending();
      }

      return new Promise<InputEvent>((resolve, reject) => {
        pending = {
          actionId,
          deviceType,
          resolve,
          reject
        };

        if (timeoutMs && timeoutMs > 0) {
          pending.timeoutId = setTimeout(() => {
            if (pending) {
              pending.reject(new Error("Rebind timed out."));
              resetPending();
            }
          }, timeoutMs);
        }
      });
    },
    cancel() {
      if (pending) {
        pending.reject(new Error("Rebind cancelled."));
      }
      resetPending();
    }
  };
}
