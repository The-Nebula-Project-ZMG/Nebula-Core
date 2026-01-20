# Nebula Core

**Nebula Core** is an open-source, NPM-based toolkit developed under **The Nebula Project**.

Its purpose is to provide shared, modular building blocks for creating **modern, full desktop applications** that are fully usable with **both controllers and keyboard/mouse**, with first-class support for **Steam Deck and SteamOS**.

Nebula Core is designed to be **optional, replaceable, and library-first**. Applications are never required to depend on Nebula Core to exist.

---

## What Nebula Core Is

Nebula Core is a collection of small, focused packages that solve common problems involved in building **controller-first desktop applications**, including:

- Input abstraction (actions instead of devices)
- Controller and keyboard navigation
- Focus management
- UI and theming primitives
- Glyph and icon mappings
- Shared utilities

Each package can be adopted independently.

Nebula Core is intended to be usable by:

- Nebula applications
- Third-party desktop apps
- Experimental tools and prototypes
- Steam Deck-targeted software

---

## What Nebula Core Is Not

Nebula Core is **not**:

- A platform or runtime
- A required dependency
- A framework that owns your app lifecycle
- A UI kit you must use visually
- A Steam-only solution

Applications should continue to function if Nebula Core is removed.

---

## Design Principles

### Library-first, not framework-first

Nebula Core does not take control of your app. You opt in only to the parts you need.

### Controller-first, desktop-complete

Controller navigation is treated as a first-class input method without sacrificing keyboard and mouse usability.

### Modular and replaceable

Every feature lives in its own package. Nothing is monolithic.

### Steam support is optional

Steam-specific behavior is isolated behind adapters and never required.

### Open and acquisition-safe

No cloud dependencies, no telemetry requirements, and a permissive open-source license.

---

## Package Overview

Nebula Core is organized as a multi-package workspace:

```
@nebula/core-utils
@nebula/core-input
@nebula/core-navigation
@nebula/core-theme
@nebula/core-glyphs
@nebula/core-ui
@nebula/steam-adapter   (optional)
```

Not all packages are required. Many applications will only use one or two.

---

## Example: Using Nebula Core Input

Nebula Core abstracts **actions**, not devices.

```js
import { InputRouter, attachKeyboard } from "@nebula/core-input";

const router = new InputRouter();
attachKeyboard(router);

router.on("confirm", () => {
  console.log("Confirm pressed");
});
```

Your application does not care whether input came from:

- Keyboard
- Gamepad
- Steam Input
- Future devices

---

## Nebula Compatibility

An application is considered **Nebula compatible** if it:

- Uses action-based input
- Supports controller navigation
- Respects focus-based interaction
- Avoids hard Steam dependencies

Nebula compatibility does **not** require:

- Nebula branding
- Nebula UI components
- A Nebula runtime

---

## Technology

- Authored in TypeScript
- Distributed as standard JavaScript
- Works with JavaScript and TypeScript applications
- ESM and CommonJS compatible
- Designed for Electron, web, and desktop runtimes

---

## Repository Structure

```
packages/    Core packages
examples/    Minimal usage examples
.changeset/ Versioning and release notes
```

---

## License

Nebula Core is released under the **MIT License**.

You are free to use it in:

- Open-source projects
- Commercial products
- Internal tools
- Experimental software

---

## Status

Nebula Core is under active development.

APIs are evolving, but the guiding principles are stable.