# updateAttributes
The `updateAttributes` command sets attributes of a node or mark to new values. Not passed attributes won’t be touched.

## Parameters

`typeOrName: string | NodeType | MarkType`

Pass the type you want to update, for example `'heading'`.

`attributes: Record<string, any>`

This expects an object with the attributes that need to be updated. It doesn’t need to have all attributes.

## Usage
```js
// Update node attributes
editor.commands.updateAttributes('heading', { level: 1 })

// Update mark attributes
editor.commands.updateAttributes('highlight', { color: 'pink' })
```

