<script lang="ts">
  import { getEditor, useEditorState } from '@tiptap/svelte'

  const editor = getEditor()

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isStrike: editor.isActive('strike'),
      isCode: editor.isActive('code'),
      isParagraph: editor.isActive('paragraph'),
      isH1: editor.isActive('heading', { level: 1 }),
      isH2: editor.isActive('heading', { level: 2 }),
      isH3: editor.isActive('heading', { level: 3 }),
      isH4: editor.isActive('heading', { level: 4 }),
      isH5: editor.isActive('heading', { level: 5 }),
      isH6: editor.isActive('heading', { level: 6 }),
      isBulletList: editor.isActive('bulletList'),
      isOrderedList: editor.isActive('orderedList'),
      isCodeBlock: editor.isActive('codeBlock'),
      isBlockquote: editor.isActive('blockquote'),
      isPurple: editor.isActive('textStyle', { color: '#958DF1' }),
      canBold: editor.can().chain().focus().toggleBold().run(),
      canItalic: editor.can().chain().focus().toggleItalic().run(),
      canStrike: editor.can().chain().focus().toggleStrike().run(),
      canCode: editor.can().chain().focus().toggleCode().run(),
      canUndo: editor.can().chain().focus().undo().run(),
      canRedo: editor.can().chain().focus().redo().run(),
    }),
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleBold().run()} disabled={!$state.canBold} class={$state.isBold ? 'is-active' : ''}>Bold</button>
    <button onclick={() => editor.chain().focus().toggleItalic().run()} disabled={!$state.canItalic} class={$state.isItalic ? 'is-active' : ''}>Italic</button>
    <button onclick={() => editor.chain().focus().toggleStrike().run()} disabled={!$state.canStrike} class={$state.isStrike ? 'is-active' : ''}>Strike</button>
    <button onclick={() => editor.chain().focus().toggleCode().run()} disabled={!$state.canCode} class={$state.isCode ? 'is-active' : ''}>Code</button>
    <button onclick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
    <button onclick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button>
    <button onclick={() => editor.chain().focus().setParagraph().run()} class={$state.isParagraph ? 'is-active' : ''}>Paragraph</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} class={$state.isH1 ? 'is-active' : ''}>H1</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} class={$state.isH2 ? 'is-active' : ''}>H2</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} class={$state.isH3 ? 'is-active' : ''}>H3</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} class={$state.isH4 ? 'is-active' : ''}>H4</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} class={$state.isH5 ? 'is-active' : ''}>H5</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} class={$state.isH6 ? 'is-active' : ''}>H6</button>
    <button onclick={() => editor.chain().focus().toggleBulletList().run()} class={$state.isBulletList ? 'is-active' : ''}>Bullet list</button>
    <button onclick={() => editor.chain().focus().toggleOrderedList().run()} class={$state.isOrderedList ? 'is-active' : ''}>Ordered list</button>
    <button onclick={() => editor.chain().focus().toggleCodeBlock().run()} class={$state.isCodeBlock ? 'is-active' : ''}>Code block</button>
    <button onclick={() => editor.chain().focus().toggleBlockquote().run()} class={$state.isBlockquote ? 'is-active' : ''}>Blockquote</button>
    <button onclick={() => editor.chain().focus().setHorizontalRule().run()}>Horizontal rule</button>
    <button onclick={() => editor.chain().focus().setHardBreak().run()}>Hard break</button>
    <button onclick={() => editor.chain().focus().undo().run()} disabled={!$state.canUndo}>Undo</button>
    <button onclick={() => editor.chain().focus().redo().run()} disabled={!$state.canRedo}>Redo</button>
    <button onclick={() => editor.chain().focus().setColor('#958DF1').run()} class={$state.isPurple ? 'is-active' : ''}>Purple</button>
  </div>
</div>
