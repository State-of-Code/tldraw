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

Use the `Tldraw` component with a live shape-count badge, brainstorming board, and five-minute timer.

---

The `Tldraw` component renders the full tldraw editor as a regular React component. Put it anywhere in your React tree; it fills whatever container it's given, so the container needs a size. Here `.tldraw__editor` makes it fill the page.

Import `tldraw/tldraw.css` alongside the component. Without it, the editor's UI has no styling.

The top-right badge shows the number of shapes on the current page and how many are selected. Its `track` wrapper keeps both counts up to date as shapes are created, selected, or deleted. The custom `SharePanel` also renders `DefaultSharePanel`, keeping the existing controls available.

Choose **Insert brainstorming board** to add Ideas, In Progress, and Done columns with three blank sticky notes each. The notes can be edited and moved between columns. Each insertion preserves existing content and can be undone in one step.

The five-minute countdown starts paused. Use **Start**, **Pause**, and **Reset** to control the session; completion shows a time-up message. The timer stays active when focus mode hides its controls. It is local to this browser tab and resets when the example is reloaded.

By default the editor does not persist between refreshes or sync between tabs. To keep your work after a refresh, see the [persistence key example](https://tldraw.dev/examples/persistence-key).
