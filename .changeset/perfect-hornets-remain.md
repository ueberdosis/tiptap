---
'@tiptap/extension-bubble-menu': patch
---

Remove recently added `updateBubbleMenuPosition` method because it would not work in the React and Vue versions of the BubbleMenu, only in the vanilla extension. And that would confuse developers.

Write the `transactionHandler` method as an arrow function because arrow functions have no `this`, so the `this` remains the instance of the `BubbleMenuView` class.