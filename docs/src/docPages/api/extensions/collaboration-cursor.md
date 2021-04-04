# CollaborationCursor
[![Version](https://img.shields.io/npm/v/@tiptap/extension-collaboration-cursor.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-collaboration-cursor)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-collaboration-cursor.svg)](https://npmcharts.com/compare/@tiptap/extension-collaboration-cursor?minimal=true)

This extension adds information about all connected users (like their name and a specified color), their current cursor position and their text selection (if there’s one).

Open this page in multiple browser windows to test it.

:::pro Pro Extension
We kindly ask you to [sponsor our work](/sponsor) when using this extension in production.
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-collaboration-cursor

# with Yarn
yarn add @tiptap/extension-collaboration-cursor
```

This extension requires the [`Collaboration`](/api/extensions/collaboration) extension.

## Settings
| Option   | Type       | Default                       | Description                                                                                                                                                                         |
| -------- | ---------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| provider | `Object`   | `null`                        | A Y.js network connection, for example a [y-websocket](https://github.com/yjs/y-websocket) instance.                                                                                |
| user     | `Object`   | `{ user: null, color: null }` | Attributes of the current user, assumes to have a name and a color, but can be used with any attribute.                                                                             |
| render   | `Function` | …                             | A render function for the cursor, look at [the extension source code](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-collaboration-cursor/) for an example. |

## Commands
| Command | Parameters | Description                                                                                      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------ |
| user    | attributes | An object with the attributes of the current user, by default it expects a `name` and a `color`. |

## Source code
[packages/extension-collaboration-cursor/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-collaboration-cursor/)

## Usage
:::warning Public
The content of this editor is shared with other users.
:::

<demo name="Extensions/CollaborationCursor" hide-source />
<demo name="Extensions/CollaborationCursor" highlight="11,39-45" />
