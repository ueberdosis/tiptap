<template>
  <div class="annotation-demo">
    <div class="annotation-clients">
      <section
        v-for="(client, index) in clients"
        :key="client.name"
        class="annotation-client"
        :aria-label="client.name"
      >
        <div class="control-group">
          <h2>{{ client.name }}</h2>
          <label :for="`annotation-text-${index}`">Annotation</label>
          <input
            :id="`annotation-text-${index}`"
            v-model="drafts[index]"
            placeholder="Write an annotation"
          />
          <div class="button-group">
            <button
              :disabled="!client.editor.can().addAnnotation(drafts[index])"
              @mousedown.prevent
              @click="client.editor.commands.addAnnotation(drafts[index])"
            >
              Annotate
            </button>
            <button @mousedown.prevent @click="moveSelectedBlock(client.editor)">
              Move block to end
            </button>
            <button :disabled="!client.editor.can().undo()" @click="client.editor.commands.undo()">
              Undo
            </button>
            <button :disabled="!client.editor.can().redo()" @click="client.editor.commands.redo()">
              Redo
            </button>
          </div>
        </div>

        <editor-content
          :editor="client.editor"
          :class="['annotation-editor', `editor-${index + 1}`]"
        />

        <annotation-list :editor="client.editor" :annotations="client.annotations" />

        <details class="output-group">
          <summary>Stored Y.Map annotations</summary>
          <pre :data-testid="`annotations-${index}`">{{ client.stored }}</pre>
        </details>
        <details class="output-group">
          <summary>Document JSON without annotations</summary>
          <pre :data-testid="`document-${index}`">{{ client.content }}</pre>
        </details>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSchema } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { prosemirrorJSONToYXmlFragment } from '@tiptap/y-tiptap'
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import * as Y from 'yjs'
import { connectDocuments } from './connectDocuments.js'
import { content } from './content.js'
import CollaborationAnnotation from './extension/index.js'
import type { Annotation, ResolvedAnnotation } from './extension/types/Annotation.js'
import { moveSelectedBlock } from './moveSelectedBlock.js'
import type { DemoClient } from './types/DemoClient.js'
import AnnotationList from './AnnotationList.vue'

const clients = shallowRef<DemoClient[]>([])
const drafts = ref(['A text or image annotation', 'Another annotation'])
const documents = [new Y.Doc(), new Y.Doc()]
let disconnect = () => {}

function refreshClient(index: number, annotations?: ResolvedAnnotation[]) {
  clients.value = clients.value.map((client, current) =>
    current === index
      ? {
          ...client,
          annotations: annotations ?? client.annotations,
          stored: JSON.stringify(client.document.getMap('annotations').toJSON(), null, 2),
          content: JSON.stringify(client.editor.getJSON(), null, 2),
        }
      : client,
  )
}

onMounted(() => {
  prosemirrorJSONToYXmlFragment(
    getSchema([StarterKit, Image]),
    content,
    documents[0].getXmlFragment('default'),
  )
  Y.applyUpdate(documents[1], Y.encodeStateAsUpdate(documents[0]))
  disconnect = connectDocuments(documents[0], documents[1])

  clients.value = documents.map((document, index) => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Image,
        Collaboration.configure({ document }),
        CollaborationAnnotation.configure({
          map: document.getMap<Annotation>('annotations'),
          onUpdate: annotations => refreshClient(index, annotations),
        }),
      ],
      onSelectionUpdate: () => refreshClient(index),
    })

    return {
      name: `Client ${index + 1}`,
      document,
      editor,
      annotations: [],
      stored: '{}',
      content: JSON.stringify(editor.getJSON(), null, 2),
    }
  })
})

onBeforeUnmount(() => {
  disconnect()
  clients.value.forEach(client => client.editor.destroy())
  documents.forEach(document => document.destroy())
})
</script>

<style lang="scss">
.annotation-clients {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.annotation-client {
  min-width: 0;
  border: 1px solid var(--gray-3);
  border-radius: 0.5rem;
  overflow: hidden;

  input {
    display: block;
    width: 100%;
    margin: 0.5rem 0;
  }

  pre {
    max-height: 20rem;
    overflow: auto;
    font-size: 0.75rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  summary {
    cursor: pointer;
  }
}

.annotation-editor {
  .annotation {
    background: var(--yellow);
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
  }

  img.annotation {
    outline: 4px solid var(--yellow-contrast);
  }

  .ProseMirror-selectednode {
    outline: 3px solid var(--purple);
  }
}

.annotation-list {
  li + li {
    margin-top: 1rem;
  }

  small {
    color: var(--gray-5);
  }
}

@media (max-width: 760px) {
  .annotation-clients {
    grid-template-columns: 1fr;
  }
}
</style>
