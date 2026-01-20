export type InputDeviceType = "keyboard" | "mouse" | "gamepad" | "touch";

export type InputAction = {
  id: string;
  label: string;
  deviceTypes: InputDeviceType[];
};

export type InputGlyph = {
  actionId: string;
  glyph: string;
};

export type InputEventPhase = "pressed" | "released" | "repeat" | "axis";

export type InputEvent = {
  deviceType: InputDeviceType;
  actionId: string;
  phase: InputEventPhase;
  timestamp: number;
  value?: number;
  raw?: unknown;
};

export type InputActionRegistry = {
  register(action: InputAction): void;
  get(id: string): InputAction | null;
  list(): InputAction[];
};

export type Unsubscribe = () => void;
