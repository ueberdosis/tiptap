export const mdContent = `# Welcome to Markdown Parser Demo

This demo showcases **bidirectional** markdown support in Tiptap with extended features.

## Features

- **Bold text** and *italic text*
- \`inline code\` and code blocks
- [Links](https://tiptap.dev)
- Lists and more!

## Extended Features

## Task Lists

- [ ] Incomplete task
  - [ ] Nested incomplete task
  - [x] Completed task
- [x] Completed task
  - [ ] Incomplete task
  - [x] Completed task

### YouTube Videos

[@youtube https://www.youtube.com/watch?v=dQw4w9WgXcQ](0, 400, 300)

### Images

![Random Image](https://unsplash.it/400/600 "Tiptap Editor")

### Mentions

Hey, @[Madonna](1), have you seen @[Tom Cruise](2)?

### Mathematics

Inline math: $E = mc^2$ and $\\pi r^2$

Block math:

$$
40*5/38
$$

### Custom React Component

\`\`\`react
This is a custom React node view with fenced syntax!
\`\`\`

\`\`\`react
And here is another one with even more content. How great is this?

Absolutely fantastic!
\`\`\`

### Try editing the markdown on the left:

1. Edit the markdown text
2. Click "Parse Markdown"
3. See it render in the editor!
4. Try adding YouTube videos, mentions, math expressions, and custom components directly in the editor
5. Click "Extract Markdown" to see the serialized output

You can also edit in the editor and see the markdown update.`
