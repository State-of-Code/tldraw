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

The simplest way to use the `Tldraw` component.

---

The `Tldraw` component renders the full tldraw editor as a regular React component. Put it anywhere in your React tree; it fills whatever container it's given, so the container needs a size. Here `.tldraw__editor` makes it fill the page.

Import `tldraw/tldraw.css` alongside the component. Without it, the editor's UI has no styling.

The badge in the top-right `SharePanel` slot shows the current page's shape count and selected shape count. It uses `useValue` to update both counts as the editor changes.

Click **Insert brainstorming board** to add **Ideas**, **In Progress**, and **Done** columns with blank sticky notes. Drag notes between columns and double-click them to write an idea. Inserting a board keeps existing shapes and can be undone.

The five-minute session timer starts at **05:00**. Start it when you're ready, pause or resume as needed, and reset it for another session. At **00:00**, it stops and shows **Time's up**; it does not lock the canvas or remove your work.

By default the editor does not persist between refreshes or sync between tabs. To keep your work after a refresh, see the [persistence key example](https://tldraw.dev/examples/persistence-key).
