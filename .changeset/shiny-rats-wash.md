---
'@tiptap/extension-mathematics': major
---

The Math extension now uses **nodes** to render mathematic content in the editor. This should improve the performance when an editor renders many math equations at the same time.

This change is not backwards compatible, so you will need to update your code to use the new node-based API.

At the same time, the `Mathematics` extension  has been renamed to `Math` to better align with the naming conventions of other extensions - but the old name is still available for backwards compatibility.

This extension includes two new nodes:
- `MathInline` for inline math equations
- `MathBlock` for block math equations

The regex patterns for the input rules were also updated to be less conflicting with text including dollar signs. The new patterns are:
- Inline: `/(?<!\$)\$\$([^$\n]+)\$\$(?!\$)$/` - for inline math equations, which will match text between two double dollar signs.
- Block: `/^\$\$\$([^$]+)\$\$\$$/` - for block math equations, which will match text between two triple dollar signs.

Since the old way of using text content to reflect math equations came with limitations and performance issues, the new node-based approach now requires an explicit update command to update a math equations latex content. This can be done by using:

- `editor.commands.updateInlineMath({ latex: '3x^2 + 2x + 1' })` for inline math equations.
- `editor.commands.updateBlockMath({ latex: '3x^2 + 2x + 1' })` for block math equations.

Both nodes allow for an `onClick` option that will pass the position and node information up which can be used to trigger a custom action, such as opening a math editor dialog.