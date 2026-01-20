import type { InputEvent } from "./types.js";

export type InputSnapshotEntry = {
  actionId: string;
  pressed: boolean;
  value: number;
  lastUpdated: number;
};

export type InputSnapshotStore = {
  update(event: InputEvent): void;
  isPressed(actionId: string): boolean;
  getValue(actionId: string): number;
  get(actionId: string): InputSnapshotEntry | null;
  list(): InputSnapshotEntry[];
  clear(): void;
};

export function createInputSnapshotStore(): InputSnapshotStore {
  const state = new Map<string, InputSnapshotEntry>();

  const ensureEntry = (actionId: string): InputSnapshotEntry => {
    const existing = state.get(actionId);
    if (existing) {
      return existing;
    }
    const entry: InputSnapshotEntry = {
      actionId,
      pressed: false,
      value: 0,
      lastUpdated: 0
    };
    state.set(actionId, entry);
    return entry;
  };

  return {
    update(event) {
      const entry = ensureEntry(event.actionId);
      entry.lastUpdated = event.timestamp;

      switch (event.phase) {
        case "pressed":
        case "repeat":
          entry.pressed = true;
          entry.value = event.value ?? 1;
          break;
        case "released":
          entry.pressed = false;
          entry.value = 0;
          break;
        case "axis":
          entry.value = event.value ?? 0;
          entry.pressed = entry.value !== 0;
          break;
        default:
          break;
      }
    },
    isPressed(actionId) {
      return state.get(actionId)?.pressed ?? false;
    },
    getValue(actionId) {
      return state.get(actionId)?.value ?? 0;
    },
    get(actionId) {
      return state.get(actionId) ?? null;
    },
    list() {
      return Array.from(state.values());
    },
    clear() {
      state.clear();
    }
  };
}
