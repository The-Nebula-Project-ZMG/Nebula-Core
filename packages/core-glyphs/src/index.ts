export type GlyphResolutionOptions = {
  themeId?: string;
};

export type GlyphProvider = {
  id: string;
  getGlyph(actionId: string, themeId?: string): string | null;
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
    resolve(actionId: string, options?: GlyphResolutionOptions) {
      const themeId = options?.themeId;
      for (const provider of providers.values()) {
        const glyph = provider.getGlyph(actionId, themeId);
        if (glyph) return glyph;
      }
      return null;
    }
  };
}
