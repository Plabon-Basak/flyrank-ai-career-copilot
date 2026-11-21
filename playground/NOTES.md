# FE-05: Accessible Component Fundamentals

## 1. Hand-built components

- **Modal** (`src/components/Modal.tsx`) uses `isOpen`/`onClose` props and renders an inline backdrop containing a `role="dialog"` element with `aria-modal`, `aria-labelledby`, and `tabIndex={-1}`. A `useEffect` moves focus inside on open, listens on `document` for Escape and Tab/Shift+Tab to wrap focus, uses a `focusin` listener to reclaim programmatically moved focus, and restores the original trigger in cleanup.
- **Tabs** (`src/components/Tabs.tsx`) keeps a selected index in `useState`, stores tab buttons in a ref array, and implements the APG roles and relationships (`tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`, `aria-labelledby`). Arrow keys, Home, and End move focus with automatic activation; a roving `tabIndex` makes only the selected tab tabbable.
- **Disclosure** (`src/components/Disclosure.tsx`) uses `useState` plus `useId()`-derived IDs for a semantic button (`aria-expanded`, `aria-controls`) and a named `role="region"` panel that is hidden when collapsed. Enter/Space come from native button behavior.

## 2. shadcn/ui components

The generated files are thin styling wrappers; they do not implement interaction logic themselves.

- **Dialog** (`src/components/ui/dialog.tsx`) imports `Dialog as DialogPrimitive` from `radix-ui` and forwards props to `DialogPrimitive.Root`, `Trigger`, `Portal`, `Overlay`, `Close`, `Content`, `Title`, and `Description`. `DialogContent` composes `DialogPortal` + `DialogOverlay` + `DialogPrimitive.Content` and adds a close button via `DialogPrimitive.Close`; `Header`/`Footer` are plain `div`s. Tailwind classes are merged with `cn` and marked with `data-slot` attributes.
- **Tabs** (`src/components/ui/tabs.tsx`) wraps `TabsPrimitive.Root`, `List`, `Trigger`, and `Content`, sets a default `orientation="horizontal"`, and adds `data-orientation`, `cva` variants, and `cn`-merged styling. Keyboard behavior and ARIA state are delegated to Radix.

I verified that `radix-ui/src/dialog.ts` and `radix-ui/src/tabs.ts` simply re-export `@radix-ui/react-dialog` and `@radix-ui/react-tabs`.

## 3. What shadcn/Radix handles that my implementation does not

1. **Portalling, overlay, and background handling.** Radix `DialogPortal` mounts children through `PortalPrimitive` under `Presence`; `DialogOverlayImpl` wraps the overlay in `RemoveScroll`, and `DialogContentModal` calls `hideOthers(content)` from `aria-hidden` to hide surrounding content from assistive tech. My modal is rendered inline inside the playground card, relies only on `aria-modal`, and has no separate portal/overlay layers or scroll lock.
2. **More complete focus management.** Radix `FocusScope` (used by `DialogContentImpl` with `loop` and `trapped={context.open}`) handles `focusin`, `focusout`, and a `MutationObserver` for a focused node removed from the DOM; it finds tabbable candidates with a `TreeWalker` using `tabIndex >= 0` plus `checkVisibility`, and uses a focus-scope stack for nested layers. Dialog auto-focus on close explicitly refocuses `triggerRef`. My modal implements the basic Tab wrap, Escape, and focus restoration with manual listeners and a selector-based candidate list, so it does not cover nested scopes, removed focused elements, or pointer-based trapping.
3. **Tabs orientation, direction, and configurable roving focus.** Radix `Tabs` supports `orientation`, `dir`, `activationMode` (`automatic`/`manual`), and controlled `value`; `TabsList` wraps `RovingFocusGroup.Root` with `loop`, and the roving-focus item maps Arrow keys, Home/End, and PageUp/PageDown, remaps arrows for RTL, and excludes non-focusable items. IDs and `aria-controls` are generated from `useId()`. My tabs hard-code horizontal-only ArrowLeft/ArrowRight handling and a fixed three-item array.

These details were verified in the installed packages' `dist/index.mjs.map` original sources: `react-dialog.tsx`, `react-focus-scope.tsx`, `react-tabs.tsx`, and `react-roving-focus.tsx`.

## 4. What I learned

Building the behavior myself made each ARIA relationship and key handler explicit, which helped me understand the APG patterns and keep the components dependency-free. The trade-off is edge-case coverage: Radix/shadcn centralize focus edge cases, portalling, direction, and dynamic/disabled items in tested primitives, at the cost of added dependency weight and a styling layer whose behavior is harder to see from the wrapper alone. I learned to read the installed source before claiming a feature rather than relying on assumptions about a library.
