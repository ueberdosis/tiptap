import { Extension, Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'

import { Editor, EditorContent, NodeViewWrapper, VueNodeViewRenderer } from '../../src/index.js'

const dispose: (() => void)[] = []
afterEach(() => {
  dispose.splice(0).forEach(cleanup => cleanup())
})

describe('EditorContent lifecycle', () => {
  it('exposes initialized plugin state while plugin views mount', () => {
    const key = new PluginKey<number>('vueLifecycleState')
    const values: (number | undefined)[] = []
    const editor = new Editor({
      extensions: [
        StarterKit,
        Extension.create({
          name: 'vueLifecycleState',
          addProseMirrorPlugins() {
            return [
              new Plugin({
                key,
                state: { init: () => 7, apply: (_transaction, value) => value },
                view: () => {
                  values.push(key.getState(this.editor.state))
                  return {}
                },
              }),
            ]
          },
        }),
      ],
    })
    dispose.push(() => editor.destroy())
    editor.mount(document.createElement('div'))
    expect(values).toEqual([7])
    editor.unmount()
    editor.mount(document.createElement('div'))
    expect(values).toEqual([7, 7])
  })

  it('builds three NodeViews once per mount and supports remounting', async () => {
    const destroyed = vi.fn()
    const renderer = VueNodeViewRenderer(
      defineComponent({ render: () => h(NodeViewWrapper, null, () => 'Node') }),
    )
    const createNodeView = vi.fn((...args: Parameters<typeof renderer>) => {
      const nodeView = renderer(...args)
      const destroy = nodeView.destroy?.bind(nodeView)
      nodeView.destroy = () => {
        destroyed()
        destroy?.()
      }
      return nodeView
    })
    const testNode = Node.create({
      name: 'lifecycleNode',
      group: 'block',
      atom: true,
      parseHTML: () => [{ tag: 'lifecycle-node' }],
      renderHTML: () => ['lifecycle-node'],
      addNodeView: () => createNodeView,
    })
    const mounts = vi.fn()
    const unmounts = vi.fn()
    const editor = new Editor({
      extensions: [StarterKit, testNode],
      content: '<lifecycle-node></lifecycle-node>'.repeat(3),
      onMount: mounts,
      onUnmount: unmounts,
    })
    const visible = ref(true)
    const app = createApp({ render: () => (visible.value ? h(EditorContent, { editor }) : null) })
    const element = document.createElement('div')
    document.body.append(element)
    dispose.push(() => {
      app.unmount()
      editor.destroy()
      element.remove()
    })
    app.mount(element)
    await nextTick()
    await nextTick()
    expect(createNodeView).toHaveBeenCalledTimes(3)
    expect(element.textContent).toBe('NodeNodeNode')
    expect(editor.isMounted).toBe(true)
    expect(mounts).toHaveBeenCalledTimes(1)
    visible.value = false
    await nextTick()
    expect(editor.isDestroyed).toBe(false)
    expect(editor.isMounted).toBe(false)
    expect(destroyed).toHaveBeenCalledTimes(3)
    expect(unmounts).toHaveBeenCalledTimes(1)
    visible.value = true
    await nextTick()
    await nextTick()
    expect(createNodeView).toHaveBeenCalledTimes(6)
    expect(element.textContent).toBe('NodeNodeNode')
    expect(mounts).toHaveBeenCalledTimes(2)
  })
})
