export * from "./event-emitter.js";


export type NebulaAdapter<T = unknown> = {
  id: string;
  isAvailable(): boolean;
  getCapabilities(): T;
};
