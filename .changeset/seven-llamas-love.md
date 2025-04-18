---
'@tiptap/extension-ordered-list': major
'@tiptap/extension-bullet-list': major
'@tiptap/extension-list-keymap': major
'@tiptap/extension-list-item': major
'@tiptap/extension-task-list': major
---

This adds all of the list packages to the `@tiptap/extension-list` package.

## ListKit

The `ListKit` export allows configuring all list extensions with one extension, and is the recommended way of using the list extensions.

```ts
import { ListKit } from '@tiptap/extension-list'

new Editor({
  extensions: [
    ListKit.configure({
      bulletList: {
        HTMLAttributes: 'bullet-list'
      },
      orderedList: {
        HTMLAttributes: 'ordered-list'
      },
      listItem: {
        HTMLAttributes: 'list-item'
      },
      taskList: {
        HTMLAttributes: 'task-list'
      },
      taskItem: {
        HTMLAttributes: 'task-item'
      },
      listKeymap: {}
    }),
  ],
})
```

## List repackaging

Since we've moved the code out of the list extensions to the `@tiptap/extension-list` package, you can remove the following packages from your project:

```bash
npm uninstall @tiptap/extension-ordered-list @tiptap/extension-bullet-list @tiptap/extension-list-keymap @tiptap/extension-list-item @tiptap/extension-task-list
```

And replace them with the new `@tiptap/extension-list` package:

```bash
npm install @tiptap/extension-list
```

## Want to use the extensions separately?

For more control, you can also use the extensions separately.

### BulletList

This extension adds a bullet list to the editor.

Migrate from `@tiptap/extension-bullet-list` to `@tiptap/extension-list`:

```diff
- import BulletList from '@tiptap/extension-bullet-list'
+ import { BulletList } from '@tiptap/extension-list'
```

Usage:

```ts
import { BulletList } from '@tiptap/extension-list'
```

### OrderedList

This extension adds an ordered list to the editor.

Migrate from `@tiptap/extension-ordered-list` to `@tiptap/extension-list`:

```diff
- import OrderedList from '@tiptap/extension-ordered-list'
+ import { OrderedList } from '@tiptap/extension-list'
```

Usage:

```ts
import { OrderedList } from '@tiptap/extension-list'
```

### ListItem

This extension adds a list item to the editor.

Migrate from `@tiptap/extension-list-item` to `@tiptap/extension-list`:

```diff
- import ListItem from '@tiptap/extension-list-item'
+ import { ListItem } from '@tiptap/extension-list'
```

Usage:

```ts
import { ListItem } from '@tiptap/extension-list'
```

### TaskList

This extension adds a task list to the editor.

Migrate from `@tiptap/extension-task-list` to `@tiptap/extension-list`:

```diff
- import TaskList from '@tiptap/extension-task-list'
+ import { TaskList } from '@tiptap/extension-list'
```

Usage:

```ts
import { TaskList } from '@tiptap/extension-list'
```

### TaskItem

This extension adds a task item to the editor.

Migrate from `@tiptap/extension-task-item` to `@tiptap/extension-list`:

```diff
- import TaskItem from '@tiptap/extension-task-item'
+ import { TaskItem } from '@tiptap/extension-list'
```

Usage:

```ts
import { TaskItem } from '@tiptap/extension-list'
```

### ListKeymap

This extension adds better default keybindings for lists to the editor.

Migrate from `@tiptap/extension-list-keymap` to `@tiptap/extension-list`:

```diff
- import ListKeymap from '@tiptap/extension-list-keymap'
+ import { ListKeymap } from '@tiptap/extension-list'
```

Usage:

```ts
import { ListKeymap } from '@tiptap/extension-list'
```
