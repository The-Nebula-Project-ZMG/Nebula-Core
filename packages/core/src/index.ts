export * from "./input/index.js";
export * from "./navigation/index.js";
export * from "./theming/index.js";

export type NebulaAdapter<T = unknown> = {
  id: string;
  isAvailable(): boolean;
  getCapabilities(): T;
};
