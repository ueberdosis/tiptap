---
"@tiptap/react": minor
"@tiptap/core": minor
---

This PR significantly improves the performance of React NodeViews in a couple of ways:

- It now uses useSyncExternalStore to synchronize changes between React & the editor instance
- It dramatically reduces the number of re-renders by re-using instances of React portals that have already been initialized and unaffected by the change made in the editor

We were seeing performance problems with React NodeViews because a change to one of them would cause a re-render to all instances of node views. For an application that heavily relies on node views in React, this was quite expensive.
This should dramatically cut down on the number of instances that have to re-render, and, making each of those re-renders much less costly.
