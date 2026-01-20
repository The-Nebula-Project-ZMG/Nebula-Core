export type ThemeToken = {
  id: string;
  value: string | number;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  tokens: ThemeToken[];
};

export function createThemeRegistry() {
  const themes = new Map<string, ThemeDefinition>();

  return {
    register(theme: ThemeDefinition) {
      themes.set(theme.id, theme);
    },
    get(id: string) {
      return themes.get(id) ?? null;
    },
    list() {
      return Array.from(themes.values());
    }
  };
}
