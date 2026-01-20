export type Unsubscribe = () => void;

export class EventEmitter<T> {
  private listeners = new Set<(event: T) => void>();

  on(fn: (event: T) => void): Unsubscribe {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(event: T) {
    for (const fn of this.listeners) {
      fn(event);
    }
  }

  clear() {
    this.listeners.clear();
  }
}
