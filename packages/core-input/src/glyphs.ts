import type { InputDeviceType } from "./types.js";

export type InputGlyphEntry = {
  actionId: string;
  deviceType: InputDeviceType;
  themeId?: string;
  glyph: string;
};

export type InputGlyphRegistry = {
  register(entry: InputGlyphEntry): void;
  registerMany(entries: InputGlyphEntry[]): void;
  get(actionId: string, deviceType: InputDeviceType, themeId?: string): string | null;
  list(): InputGlyphEntry[];
  clear(): void;
};

export function createInputGlyphRegistry(): InputGlyphRegistry {
  const glyphs = new Map<string, Map<InputDeviceType, Map<string | null, string>>>();

  const ensureThemeMap = (actionId: string, deviceType: InputDeviceType) => {
    let deviceMap = glyphs.get(actionId);
    if (!deviceMap) {
      deviceMap = new Map<InputDeviceType, Map<string | null, string>>();
      glyphs.set(actionId, deviceMap);
    }
    let themeMap = deviceMap.get(deviceType);
    if (!themeMap) {
      themeMap = new Map<string | null, string>();
      deviceMap.set(deviceType, themeMap);
    }
    return themeMap;
  };

  return {
    register(entry) {
      ensureThemeMap(entry.actionId, entry.deviceType).set(entry.themeId ?? null, entry.glyph);
    },
    registerMany(entries) {
      for (const entry of entries) {
        ensureThemeMap(entry.actionId, entry.deviceType).set(entry.themeId ?? null, entry.glyph);
      }
    },
    get(actionId, deviceType, themeId) {
      const themeMap = glyphs.get(actionId)?.get(deviceType);
      if (!themeMap) return null;
      if (themeId !== undefined) {
        return themeMap.get(themeId) ?? themeMap.get(null) ?? null;
      }
      return themeMap.get(null) ?? null;
    },
    list() {
      const entries: InputGlyphEntry[] = [];
      for (const [actionId, deviceMap] of glyphs.entries()) {
        for (const [deviceType, themeMap] of deviceMap.entries()) {
          for (const [themeKey, glyph] of themeMap.entries()) {
            entries.push({
              actionId,
              deviceType,
              themeId: themeKey ?? undefined,
              glyph
            });
          }
        }
      }
      return entries;
    },
    clear() {
      glyphs.clear();
    }
  };
}
