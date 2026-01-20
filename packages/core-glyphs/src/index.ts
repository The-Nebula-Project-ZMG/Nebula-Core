export type GlyphProvider = {
  id: string;
  getGlyph(actionId: string): string | null;
};

export function createGlyphRegistry() {
  const providers = new Map<string, GlyphProvider>();

  return {
    register(provider: GlyphProvider) {
      providers.set(provider.id, provider);
    },
    get(id: string) {
      return providers.get(id) ?? null;
    },
    list() {
      return Array.from(providers.values());
    },
    resolve(actionId: string) {
      for (const provider of providers.values()) {
        const glyph = provider.getGlyph(actionId);
        if (glyph) return glyph;
      }
      return null;
    }
  };
}
