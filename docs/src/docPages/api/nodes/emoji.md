# Emoji

## Support for emojis
There is no extension or example yet, but it’s definitely on our list to build a dedicated extension to add emoji support.

If you want to give it a shot yourself, you could start altering the [`Mention`](/api/nodes/mention) node. This uses the [`Suggestion`](/utilities/suggestion) utility, which should help with an autocomplete and such things.

:::pro Fund the development ♥
We need your support to maintain, update, support and develop tiptap 2. If you’re waiting for this extension, [become a sponsor and fund our work](/sponsor).
:::

## Bring your own emoji picker
You can use any emoji picker, or build your own. Just use [commands](/api/commands) to insert the picked emojis.

```js
this.editor.chain().focus().insertText('✨').run()
```

<demo name="Nodes/Emoji" />
