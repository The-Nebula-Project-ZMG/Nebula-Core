import type { InputEvent, InputEventPhase } from "../types.js";

export type TouchBindings = {
  tap?: string;
  longPress?: string;
  swipe?: string;
  pinch?: string;
  move?: string;
};

export type TouchAdapterOptions = {
  bindings: TouchBindings;
  onEvent: (event: InputEvent) => void;
  target?: Window | Document | HTMLElement;
  preventDefault?: boolean;
  longPressMs?: number;
  tapMaxDistance?: number;
  swipeMinDistance?: number;
};

export type TouchAdapter = {
  id: "touch";
  isAvailable(): boolean;
  start(): void;
  stop(): void;
  updateBindings(bindings: TouchBindings): void;
  getBindings(): TouchBindings;
};

type TouchPoint = {
  x: number;
  y: number;
};

export function createTouchAdapter(options: TouchAdapterOptions): TouchAdapter {
  let bindings: TouchBindings = { ...options.bindings };
  const target = options.target ?? (typeof window !== "undefined" ? window : undefined);
  const longPressMs = options.longPressMs ?? 500;
  const tapMaxDistance = options.tapMaxDistance ?? 10;
  const swipeMinDistance = options.swipeMinDistance ?? 30;
  let isActive = false;
  let touchStartTime = 0;
  let startPoints: TouchPoint[] = [];
  let lastPoints: TouchPoint[] = [];
  let initialPinchDistance: number | null = null;

  const getTimestamp = (event: Event) =>
    typeof event.timeStamp === "number" ? event.timeStamp : Date.now();

  const emit = (
    event: Event,
    phase: InputEventPhase,
    actionId: string | null,
    value?: number,
    raw?: unknown
  ) => {
    if (!actionId) {
      return;
    }

    if (options.preventDefault && event.cancelable) {
      event.preventDefault();
    }

    options.onEvent({
      deviceType: "touch",
      actionId,
      phase,
      timestamp: getTimestamp(event),
      value,
      raw
    });
  };

  const readPoints = (touches: TouchList): TouchPoint[] => {
    const points: TouchPoint[] = [];
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches.item(i);
      if (touch) {
        points.push({ x: touch.clientX, y: touch.clientY });
      }
    }
    return points;
  };

  const distance = (a: TouchPoint, b: TouchPoint) => Math.hypot(a.x - b.x, a.y - b.y);

  const handleTouchStart = (event: TouchEvent) => {
    touchStartTime = Date.now();
    startPoints = readPoints(event.touches);
    lastPoints = startPoints;
    if (startPoints.length >= 2) {
      initialPinchDistance = distance(startPoints[0], startPoints[1]);
    } else {
      initialPinchDistance = null;
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    const points = readPoints(event.touches);

    if (bindings.move && points.length > 0 && lastPoints.length > 0) {
      const dx = points[0].x - lastPoints[0].x;
      const dy = points[0].y - lastPoints[0].y;
      const value = Math.hypot(dx, dy);
      emit(event, "axis", bindings.move, value, {
        gesture: "move",
        deltaX: dx,
        deltaY: dy,
        points
      });
    }

    if (bindings.pinch && points.length >= 2) {
      const currentDistance = distance(points[0], points[1]);
      if (initialPinchDistance !== null && currentDistance !== 0) {
        const scale = currentDistance / initialPinchDistance;
        emit(event, "axis", bindings.pinch, scale, {
          gesture: "pinch",
          scale,
          points
        });
      }
    }

    lastPoints = points;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const points = readPoints(event.changedTouches);
    if (startPoints.length === 0 || points.length === 0) {
      return;
    }

    const start = startPoints[0];
    const end = points[0];
    const dist = distance(start, end);
    const elapsed = Date.now() - touchStartTime;

    if (dist >= swipeMinDistance) {
      emit(event, "axis", bindings.swipe ?? null, dist, {
        gesture: "swipe",
        distance: dist,
        start,
        end
      });
      return;
    }

    if (elapsed >= longPressMs && dist <= tapMaxDistance) {
      emit(event, "pressed", bindings.longPress ?? null, undefined, {
        gesture: "longPress",
        duration: elapsed,
        start,
        end
      });
      return;
    }

    if (dist <= tapMaxDistance) {
      emit(event, "pressed", bindings.tap ?? null, undefined, {
        gesture: "tap",
        start,
        end
      });
    }
  };

  const start = () => {
    if (!target || isActive) {
      return;
    }

    target.addEventListener("touchstart", handleTouchStart as EventListener, { passive: !options.preventDefault });
    target.addEventListener("touchmove", handleTouchMove as EventListener, { passive: !options.preventDefault });
    target.addEventListener("touchend", handleTouchEnd as EventListener);
    target.addEventListener("touchcancel", handleTouchEnd as EventListener);
    isActive = true;
  };

  const stop = () => {
    if (!target || !isActive) {
      return;
    }

    target.removeEventListener("touchstart", handleTouchStart as EventListener);
    target.removeEventListener("touchmove", handleTouchMove as EventListener);
    target.removeEventListener("touchend", handleTouchEnd as EventListener);
    target.removeEventListener("touchcancel", handleTouchEnd as EventListener);
    isActive = false;
  };

  return {
    id: "touch",
    isAvailable() {
      return Boolean(target);
    },
    start,
    stop,
    updateBindings(nextBindings) {
      bindings = { ...nextBindings };
    },
    getBindings() {
      return { ...bindings };
    }
  };
}
