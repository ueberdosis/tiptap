---
'@tiptap/react': minor
'@tiptap/vue-3': minor
'@tiptap/core': minor
---

Add support for [markviews](https://prosemirror.net/docs/ref/#view.MarkView), which allow you to render custom views for marks within the editor. This is useful for rendering custom UI for marks, like a color picker for a text color mark or a link editor for a link mark.

Here is a plain JS markview example:

```ts
Mark.create({
  // Other options...
  addMarkView() {
    return ({ mark, HTMLAttributes }) => {
      const dom = document.createElement('b')
      const contentDOM = document.createElement('span')

      dom.appendChild(contentDOM)

      return {
        dom,
        contentDOM,
      }
    }
  },
})
```

## React binding

To use a React component for a markview, you can use the `@tiptap/react` package:

```ts
import { Mark } from '@tiptap/core'
import { ReactMarkViewRenderer } from '@tiptap/react'

import Component from './Component.jsx'

export default Mark.create({
  name: 'reactComponent',

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', HTMLAttributes]
  },

  addMarkView() {
    return ReactMarkViewRenderer(Component)
  },
})
```

And here is an example of a React component:

```tsx
import { MarkViewContent, MarkViewRendererProps } from '@tiptap/react'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (props: MarkViewRendererProps) => {
  const [count, setCount] = React.useState(0)

  return (
    <span className="content" data-test-id="mark-view">
      <MarkViewContent />
      <label contentEditable={false}>
        React component:
        <button
          onClick={() => {
            setCount(count + 1)
          }}
        >
          This button has been clicked {count} times.
        </button>
      </label>
    </span>
  )
}
```

## Vue 3 binding

To use a Vue 3 component for a markview, you can use the `@tiptap/vue-3` package:

```ts
import { Mark } from '@tiptap/core'
import { VueMarkViewRenderer } from '@tiptap/vue-3'

import Component from './Component.vue'

export default Mark.create({
  name: 'vueComponent',

  parseHTML() {
    return [
      {
        tag: 'vue-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['vue-component', HTMLAttributes]
  },

  addMarkView() {
    return VueMarkViewRenderer(Component)
  },
})
```

And here is an example of a Vue 3 component:

```vue
<template>
  <span className="content" data-test-id="mark-view">
    <mark-view-content />
    <label contenteditable="false"
      >Vue Component::
      <button @click="increase" class="primary">This button has been clicked {{ count }} times.</button>
    </label>
  </span>
</template>

<script>
import { MarkViewContent, markViewProps } from '@tiptap/vue-3'
export default {
  components: {
    MarkViewContent,
  },
  data() {
    return {
      count: 0,
    }
  },
  props: markViewProps,
  methods: {
    increase() {
      this.count += 1
    },
  },
}
</script>
```
