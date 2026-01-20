# @nebula/core-input

Input abstraction helpers for Nebula Core, including adapters, routing, snapshots, glyphs, and rebinding utilities.

## Quick start

- Create an input router and manager.
- Wire adapters to the manager using `getEventHandler()`.
- Register actions and subscribe to action events.

## Minimal example

```ts
import {
  createInputManager,
  createKeyboardAdapter,
  createMouseAdapter
} from "@nebula/core-input";

const manager = createInputManager();

const keyboard = createKeyboardAdapter({
  bindings: { KeyW: "move.forward" },
  onEvent: manager.getEventHandler()
});

const mouse = createMouseAdapter({
  bindings: { buttons: { 0: "fire" }, move: "look" },
  onEvent: manager.getEventHandler()
});

manager.registerAction({
  id: "move.forward",
  label: "Move Forward",
  deviceTypes: ["keyboard"]
});

manager.registerAction({
  id: "fire",
  label: "Fire",
  deviceTypes: ["mouse"]
});

manager.onAction((event, action) => {
  console.log(action.label, event.phase, event.value);
});

manager.addAdapter(keyboard);
manager.addAdapter(mouse);
manager.start();
```
