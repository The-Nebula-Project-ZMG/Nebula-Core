import type { InputDeviceType } from "./types.js";

export type InputGlyphEntry = {
  actionId: string;
  deviceType: InputDeviceType;
  glyph: string;
};

export type InputGlyphRegistry = {
  register(entry: InputGlyphEntry): void;
  registerMany(entries: InputGlyphEntry[]): void;
  get(actionId: string, deviceType: InputDeviceType): string | null;
  list(): InputGlyphEntry[];
  clear(): void;
};

export function createInputGlyphRegistry(): InputGlyphRegistry {
  const glyphs = new Map<string, Map<InputDeviceType, string>>();

  const ensureDeviceMap = (actionId: string) => {
    let map = glyphs.get(actionId);
    if (!map) {
      map = new Map<InputDeviceType, string>();
      glyphs.set(actionId, map);
    }
    return map;
  };

  return {
    register(entry) {
      ensureDeviceMap(entry.actionId).set(entry.deviceType, entry.glyph);
    },
    registerMany(entries) {
      for (const entry of entries) {
        ensureDeviceMap(entry.actionId).set(entry.deviceType, entry.glyph);
      }
    },
    get(actionId, deviceType) {
      return glyphs.get(actionId)?.get(deviceType) ?? null;
    },
    list() {
      const entries: InputGlyphEntry[] = [];
      for (const [actionId, map] of glyphs.entries()) {
        for (const [deviceType, glyph] of map.entries()) {
          entries.push({ actionId, deviceType, glyph });
        }
      }
      return entries;
    },
    clear() {
      glyphs.clear();
    }
  };
}
