# Roadmap

## New features

* generate schema without initializing tiptap, to make SSR easier (e. g. `getSchema([new Doc(), new Paragraph()])`)

## Requested features

* Basic Styling
    * https://github.com/ueberdosis/tiptap/issues/507
* Support vor Vue.js 3
* Easily add custom classes to everything
    * https://github.com/ueberdosis/tiptap/discussions/817
* Text snippets
    * https://github.com/ueberdosis/tiptap/issues/737
* Markdown Support

## Requested extensions

* Alignment
    * https://github.com/ueberdosis/tiptap/pull/544
* Font color
* Font family
* Font size
* Created embed from pasted YouTube URL
* Superscript/Subscript
    * https://github.com/ueberdosis/tiptap/discussions/813
* Math Support
    * https://github.com/ueberdosis/tiptap/issues/179
    * https://github.com/ueberdosis/tiptap/issues/698
* Resizeable Images
    * https://gist.github.com/zachjharris/a5442efbdff11948d085b6b1406dfbe6

## Ideas

* Add more shorcuts:
    * Ctrl+I → Italic ✅
    * Ctrl+B → Bold ✅
    * Ctrl+K → Link (Medium, Tumblr, Slack, Google Docs, Word)
    * Ctrl+Shift+K → Code (Slack)
    * Shift+Enter → Line break
    * Ctrl+Shift+X → Strikethrough (Slack)
    * Alt+Shift+5 → Strikethrough (Google Docs)
    * Ctrl+Shift+6 → Strikethrough (Tumblr)
    * Ctrl+Alt+0 → Paragraph (Google Docs)
    * Ctrl+Alt+1 to 6 → Heading (Google Docs, Word, ~Medium, ~Slack)
    * Ctrl+Shift+2 → Heading (Tumblr)
    * Ctrl+Shift+7 → Ordered list (Google Docs, Slack, Tumblr)
    * Ctrl+Shift+8 → Unordered list (Google Docs, Slack, Tumblr)
    * Tab, Shift+Tab → Increase / decrease nesting in lists
    * Ctrl+], Ctrl+[ → Same as above (when Tab needs to be used)
    * Ctrl+Shift+9 → Blockquote (Tumblr)
    * Ctrl+Alt+K → Code block (Slack)
    * Ctrl+R → Horizontal ruler (Stack Overflow)
* Markdown shortcuts
    * #+Space → Heading (the number of # determines the header level)
    * *+Space, -+Space → Unordered list
    * 1.+Space → Ordered list
    * >+Space → Blockquote
    * ```+Space → Code block
    * ---- → Horizontal ruler
    * ![] → Embedded resource (not part of Slack, but would it not be fancy?)
    * :emoji: → Emoji (based on the name). A nice-to-have, most certainly.
* General shortcuts
    * Ctrl+C, Ctrl+X, Ctrl+V: copy, cut, paste
    * Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y: undo, redo
    * Ctrl+Backspace: delete previous word
    * Ctrl+Delete: delete next word
    * Ctrl+Home, Ctrl+End: go to the start / end of the whole document
    * Ctrl+F, Ctrl+G: find, find next occurrence
    * Ctrl+S: if there is no auto-saving, this should save the document
    * Ctrl+/: show shortcuts (Medium, Slack)
