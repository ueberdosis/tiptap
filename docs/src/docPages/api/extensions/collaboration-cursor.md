# CollaborationCursor
This extension adds information about all connected users (like their name and a specified color), their current cursor position and their text selection (if there’s one).

Open this page in multiple browser windows to test it.

:::premium Pro Extension
We kindly ask you to sponsor us, before using this extension in production. [Read more](/sponsor)
:::

::: warning Use with Collaboration
This extension requires the [`Collaboration`](/api/extensions/collaboration) extension.
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-collaboration-cursor

# with Yarn
yarn add @tiptap/extension-collaboration-cursor
```

## Settings
| Option   | Type       | Default     | Description                                                                         |
| -------- | ---------- | ----------- | ----------------------------------------------------------------------------------- |
| provider | `Object`   | `null`      | The Y.js provider, for example a WebSocket connection.                              |
| name     | `String`   | `'Someone'` | The name of the current user.                                                       |
| color    | `String`   | `'#cccccc'` | The current user’s cursor color.                                                    |
| render   | `Function` | …           | A render function for the cursor, look at the extension source code for an example. |

## Commands
| Command | Parameters    | Description                                                              |
| ------- | ------------- | ------------------------------------------------------------------------ |
| user    | name<br>color | The name of the current user.<br>The color of the current user’s cursor. |

## Source code
[packages/extension-collaboration-cursor/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-collaboration-cursor/)

## Usage
:::warning Public
The content of this editor is shared with other users.
:::
<demo name="Extensions/CollaborationCursor" highlight="11,48-52" />
