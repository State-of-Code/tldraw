---
title: Tldraw component
component: ./BasicExample.tsx
priority: 0
keywords:
  [
    basic,
    getting started,
    intro,
    simple,
    quick start,
    hello world,
    installation,
    first app,
    tldraw component,
  ]
---

Use the `Tldraw` component with a live shape-count badge.

---

The `Tldraw` component renders the full tldraw editor as a regular React component. Put it anywhere in your React tree; it fills whatever container it's given, so the container needs a size. Here `.tldraw__editor` makes it fill the page.

Import `tldraw/tldraw.css` alongside the component. Without it, the editor's UI has no styling.

The top-right badge shows the number of shapes on the current page and how many are selected. Its `track` wrapper keeps both counts up to date as shapes are created, selected, or deleted. The custom `SharePanel` also renders `DefaultSharePanel`, keeping the existing controls available.

By default the editor does not persist between refreshes or sync between tabs. To keep your work after a refresh, see the [persistence key example](https://tldraw.dev/examples/persistence-key).
