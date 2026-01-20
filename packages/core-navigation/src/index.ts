export type FocusDirection = "up" | "down" | "left" | "right";

export type FocusTarget = {
  id: string;
  canFocus(): boolean;
  move(direction: FocusDirection): FocusTarget | null;
};

export function createFocusManager(initialTarget: FocusTarget | null) {
  let current = initialTarget;

  return {
    getCurrent() {
      return current;
    },
    move(direction: FocusDirection) {
      if (!current) return null;
      const next = current.move(direction);
      if (next?.canFocus()) {
        current = next;
      }
      return current;
    }
  };
}
