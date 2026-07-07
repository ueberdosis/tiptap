# @tiptap/react-renderer-experimental

> **Experimental. Do not use in production.** This package is under active
> development, is not published yet, and carries no semver guarantees.

An alternative, opt-in rendering engine for Tiptap in which **React owns the
editable document DOM**, while ProseMirror keeps ownership of state,
transactions, plugins, commands, selection, input handling, clipboard, and DOM
position/geometry APIs.

Compared to the legacy `@tiptap/react` node-view integration, this renderer:

- produces no wrapper DOM (`<p>text</p>` instead of `<div><p><span>…`),
- uses no portals, so React context flows naturally through node views,
- does not require `flushSync` on the render/commit path.

## Status

Scaffold only. See [`AUDIT.md`](./AUDIT.md) for the compatibility audit and the
pinned `prosemirror-view` version this work builds against.

## License

MIT
