export type InputDeviceType = "keyboard" | "mouse" | "gamepad" | "touch";

export type InputAction = {
  id: string;
  label: string;
  deviceTypes: InputDeviceType[];
};

export type InputGlyph = {
  actionId: string;
  themeId?: string;
  glyph: string;
};

export function createInputActionRegistry() {
  const actions = new Map<string, InputAction>();

  return {
    register(action: InputAction) {
      actions.set(action.id, action);
    },
    get(id: string) {
      return actions.get(id) ?? null;
    },
    list() {
      return Array.from(actions.values());
    }
  };
}
