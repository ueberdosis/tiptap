# Table of Contents extension

Get the outline of a Tiptap document: its headings, in order, with how far each one is indented.
Everything comes from the package `@tiptap/extension-table-of-contents`. To install it and draw a
first outline, start with [Getting started](getting-started.md).

The extension draws nothing. You get the data and render the outline with your own UI.

## What you can do with it

- **Draw a sidebar that follows the document.** The extension keeps the outline in its storage,
  calls `onUpdate` on every change, and tells you which heading the reader is looking at.
  [Getting started](getting-started.md)
- **Give every heading a stable ID.** Use it for links such as `#introduction`, also on the server.
  [Heading IDs](heading-ids.md)
- **Read the outline without an editor.** On the server, in a test or from stored JSON, for the
  whole document or only part of it. [Read the outline](reading.md)
- **Show only some levels.** For example only H2 and H3, or only two levels deep.
  [Choose what the outline shows](reading.md#choose-what-the-outline-shows)

## Words used in these pages

| Word    | Meaning                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| Anchor  | A node that appears in the outline. Headings, unless you set [`anchorTypes`](options.md#anchortypes)         |
| Level   | The level stored on a heading: `2` for an H2                                                                 |
| Depth   | How far a heading is indented in the outline, starting at `1`. [Level and depth](reading.md#level-and-depth) |
| Outline | The list of anchors in document order                                                                        |

## Pages

| Page                                  | What it covers                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| [Getting started](getting-started.md) | Install, a first sidebar, going to a heading                                       |
| [Options](options.md)                 | Every option of `TableOfContents`                                                  |
| [Commands](commands.md)               | `updateTableOfContents`                                                            |
| [Storage](storage.md)                 | `editor.storage.tableOfContents` and the items `onUpdate` receives                 |
| [Heading IDs](heading-ids.md)         | How headings get their IDs, in the editor and with `generateTocIds`                |
| [Read the outline](reading.md)        | `resolveTableOfContents`, `filterTableOfContents` and level versus depth           |
| [Index helpers](index-helpers.md)     | `getHierarchicalIndexes`, `getLinearIndexes`, `getHeadlineLevel` and other exports |
| [Limits](limits.md)                   | Known limits and common problems                                                   |
