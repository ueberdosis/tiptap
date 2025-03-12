This is a [codemod](https://codemod.com) created with [`codemod init`](https://docs.codemod.com/deploying-codemods/cli#codemod-init).

## Using this codemod

You can run this codemod with the following command:

```bash
npx codemod tiptap-2-migrate-imports
```

### Before

```ts
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
```

### After

```ts
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
```

,

### Before

```ts
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
```

### After

```ts
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
```

,

### Before

```ts
import Table1 from "@tiptap/extension-table";
import TableR from "@tiptap/extension-table-row";
import TableCel from "@tiptap/extension-table-cell";
import TableHead from "@tiptap/extension-table-header";
```

### After

```ts
import {
  Table as Table1,
  TableRow as TableR,
  TableCell as TableCel,
  TableHeader as TableHead,
} from "@tiptap/extension-table";
```

,

### Before

```ts
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
```

### After

```ts
import { BulletList, OrderedList, ListItem } from "@tiptap/extension-list";
```

,

### Before

```ts
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
```

### After

```ts
import { TextStyle, Color } from "@tiptap/extension-text-style";
```

,

### Before

```ts
import { PlaceHolder } from "@tiptap/extension-placeholder";
import UndoRedo from "@tiptap/extension-undo-redo";
```

### After

```ts
import { PlaceHolder, UndoRedo } from "@tiptap/extensions";
```
