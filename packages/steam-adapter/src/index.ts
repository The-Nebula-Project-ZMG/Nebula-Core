import type { NebulaAdapter } from "@nebula/core-utils";

export type SteamAdapterCapabilities = {
  steamInput?: boolean;
  overlay?: boolean;
};

export function createSteamAdapter(): NebulaAdapter<SteamAdapterCapabilities> {
  return {
    id: "steam",
    isAvailable() {
      return false;
    },
    getCapabilities() {
      return { steamInput: false, overlay: false };
    }
  };
}
