# setMeta
Store a metadata property in the current transaction.

## Parameters
`key: string`

The name of your metadata. You can get its value at any time with [getMeta](https://prosemirror.net/docs/ref/#state.Transaction.getMeta).

`value: any`

Store any value within your metadata.

## Usage
```js
// Prevent the update event from being triggered
editor.commands.setMeta('preventUpdate', true)

// Store any value in the current transaction.
// You can get this value at any time with tr.getMeta('foo').
editor.commands.setMeta('foo', 'bar')
```
