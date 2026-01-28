import './styles.scss'

import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extensions'
import type { Node } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { MappablePosition } from '@tiptap/react'
import { Extension, useEditor, Tiptap } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

/**
 * Generates HTML content with the specified number of paragraphs.
 * @param paragraphCount - The number of paragraphs to generate.
 * @returns HTML string with the generated content.
 */
function generateContent(paragraphCount: number): string {
  const loremPhrases = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
    'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse.',
    'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.',
    'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.',
  ]

  const paragraphs: string[] = []

  for (let i = 0; i < paragraphCount; i += 1) {
    const sentenceCount = 3 + Math.floor(Math.random() * 5)
    const sentences: string[] = []

    for (let j = 0; j < sentenceCount; j += 1) {
      sentences.push(loremPhrases[Math.floor(Math.random() * loremPhrases.length)])
    }

    paragraphs.push(`<p>${sentences.join(' ')}</p>`)
  }

  return paragraphs.join('\n')
}

/**
 * Content size presets with different amounts of text.
 */
const CONTENT_SIZES = {
  small: generateContent(5),
  medium: generateContent(25),
  large: generateContent(100),
  veryLarge: generateContent(500),
} as const

type ContentSize = keyof typeof CONTENT_SIZES

/**
 * Decoration count options.
 */
const DECORATION_COUNTS = [5, 50, 500, 1000] as const

type DecorationCount = (typeof DECORATION_COUNTS)[number]

/**
 * Creates a ProseMirror DecorationSet from a list of positions.
 * @param positions - The positions where the decorations should be placed.
 * @param doc - The ProseMirror document node.
 * @returns A ProseMirror DecorationSet.
 */
function createDecorations(positions: number[], doc: Node): DecorationSet {
  const validPositions = positions.filter(pos => pos >= 0 && pos <= doc.content.size)

  return DecorationSet.create(
    doc,
    validPositions.map(position =>
      Decoration.widget(position, () => {
        const element = document.createElement('span')

        element.classList.add('decoration')

        return element
      }),
    ),
  )
}

/**
 * The state of the DecorationsExtension ProseMirror plugin.
 */
interface PluginState {
  positions: MappablePosition[]
  decorations: DecorationSet
}

const DecorationsPluginKey = new PluginKey<PluginState>('decorations')

/**
 * Metadata for the decorations plugin transactions.
 */
interface DecorationsMeta {
  type: 'add' | 'set' | 'clear'
  positions?: MappablePosition[]
}

/**
 * Callback type for performance logging from the extension.
 */
type PerformanceCallback = (action: string, duration: number) => void

/**
 * Global ref for the performance callback, set by the component.
 */
let performanceCallback: PerformanceCallback | null = null

/**
 * Sets the performance callback for the decorations extension.
 * @param callback - The callback to invoke with performance data.
 */
function setPerformanceCallback(callback: PerformanceCallback | null): void {
  performanceCallback = callback
}

/**
 * An extension that allows you to insert decorations into the editor.
 * Tracks decoration positions and remaps them on document changes.
 * Also measures the time taken for position mapping.
 */
const DecorationsExtension = Extension.create({
  name: 'decorations',
  addProseMirrorPlugins() {
    const editor = this.editor

    return [
      new Plugin<PluginState>({
        key: DecorationsPluginKey,
        state: {
          init: () => ({
            positions: [],
            decorations: DecorationSet.empty,
          }),
          apply(transaction, pluginState, _oldState, newState) {
            let positions = pluginState.positions
            let mappingDuration = 0

            if (transaction.docChanged && positions.length > 0) {
              const startTime = performance.now()

              positions = positions.map(position => editor.utils.getUpdatedPosition(position, transaction).position)
              mappingDuration = performance.now() - startTime

              if (performanceCallback) {
                performanceCallback(`Position mapping (${positions.length} positions)`, mappingDuration)
              }
            }

            const metadata = transaction.getMeta(DecorationsPluginKey) as DecorationsMeta | undefined

            if (metadata) {
              if (metadata.type === 'clear') {
                positions = []
              } else if (metadata.type === 'set' && metadata.positions) {
                positions = metadata.positions
              } else if (metadata.type === 'add' && metadata.positions) {
                positions = [...positions, ...metadata.positions]
              }
            }

            return {
              positions,
              decorations: createDecorations(
                positions.map(position => position.position),
                newState.doc,
              ),
            }
          },
        },
        props: {
          decorations: state => DecorationsPluginKey.getState(state)?.decorations,
        },
      }),
    ]
  },
})

const ydoc = new Y.Doc()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const provider = new WebrtcProvider('tiptap-collab-mapping-perf-experiment', ydoc)

/**
 * Performance logging entry.
 */
interface PerformanceEntry {
  timestamp: number
  action: string
  duration: number
}

export default () => {
  const [contentSize, setContentSize] = useState<ContentSize>('small')
  const [decorationCount, setDecorationCount] = useState<DecorationCount>(5)
  const [performanceLog, setPerformanceLog] = useState<PerformanceEntry[]>([])
  const [currentDecorationCount, setCurrentDecorationCount] = useState(0)
  const [docSize, setDocSize] = useState(0)

  const transactionStartTime = useRef<number | null>(null)
  const pendingAction = useRef<string | null>(null)

  /**
   * Logs a performance measurement.
   */
  const logPerformance = useCallback((action: string, duration: number) => {
    setPerformanceLog(prev => [{ timestamp: Date.now(), action, duration }, ...prev.slice(0, 99)])
  }, [])

  useEffect(() => {
    setPerformanceCallback(logPerformance)

    return () => {
      setPerformanceCallback(null)
    }
  }, [logPerformance])

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: ydoc,
      }),
      Placeholder.configure({
        placeholder: 'Content will be loaded here...',
      }),
      DecorationsExtension,
    ],
    onTransaction: () => {
      if (transactionStartTime.current !== null && pendingAction.current !== null) {
        const duration = performance.now() - transactionStartTime.current

        logPerformance(pendingAction.current, duration)
        transactionStartTime.current = null
        pendingAction.current = null
      }
    },
    onUpdate: ({ editor: updatedEditor }) => {
      setDocSize(updatedEditor.state.doc.content.size)
    },
  })

  /**
   * Starts timing a measured action.
   */
  const startTiming = useCallback((action: string) => {
    transactionStartTime.current = performance.now()
    pendingAction.current = action
  }, [])

  /**
   * Loads content of the selected size into the editor.
   */
  const loadContent = useCallback(() => {
    if (!editor) {
      return
    }

    startTiming(`Load ${contentSize} content`)

    editor.commands.command(({ tr }) => {
      tr.setMeta(DecorationsPluginKey, { type: 'clear' })

      return true
    })

    editor.commands.setContent(CONTENT_SIZES[contentSize])
    setCurrentDecorationCount(0)
  }, [editor, contentSize, startTiming])

  /**
   * Generates random positions within the document.
   */
  const generateRandomPositions = useCallback(
    (count: number): number[] => {
      if (!editor) {
        return []
      }

      const size = editor.state.doc.content.size
      const positions: number[] = []

      for (let i = 0; i < count; i += 1) {
        const pos = Math.floor(Math.random() * (size - 1)) + 1

        positions.push(pos)
      }

      return positions.sort((a, b) => a - b)
    },
    [editor],
  )

  /**
   * Adds decorations at random positions in the document.
   */
  const addDecorations = useCallback(() => {
    if (!editor) {
      return
    }

    startTiming(`Add ${decorationCount} decorations`)
    const positions = generateRandomPositions(decorationCount)

    editor.commands.command(({ tr }) => {
      const metadata: DecorationsMeta = {
        type: 'set',
        positions: positions.map(position => editor.utils.createMappablePosition(position)),
      }
      tr.setMeta(DecorationsPluginKey, metadata)

      return true
    })

    setCurrentDecorationCount(decorationCount)
  }, [editor, decorationCount, generateRandomPositions, startTiming])

  /**
   * Clears all decorations from the editor.
   */
  const clearDecorations = useCallback(() => {
    if (!editor) {
      return
    }

    startTiming('Clear decorations')

    editor.commands.command(({ tr }) => {
      tr.setMeta(DecorationsPluginKey, { type: 'clear' })

      return true
    })

    setCurrentDecorationCount(0)
  }, [editor, startTiming])

  /**
   * Runs a typing simulation to test position mapping performance.
   */
  const runTypingTest = useCallback(() => {
    if (!editor) {
      return
    }

    startTiming(`Insert text (${currentDecorationCount} decorations)`)
    const testString = 'Testing position mapping performance. '
    const insertPosition = Math.floor(editor.state.doc.content.size / 2)

    editor.commands.insertContentAt(insertPosition, testString)
  }, [editor, currentDecorationCount, startTiming])

  /**
   * Clears the performance log.
   */
  const clearLog = useCallback(() => {
    setPerformanceLog([])
  }, [])

  useEffect(() => {
    if (editor && editor.isEmpty) {
      loadContent()
    }
  }, [editor, loadContent])

  useEffect(() => {
    if (editor) {
      setDocSize(editor.state.doc.content.size)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <label>Content:</label>
          <select value={contentSize} onChange={e => setContentSize(e.target.value as ContentSize)}>
            <option value="small">Small (5p)</option>
            <option value="medium">Medium (25p)</option>
            <option value="large">Large (100p)</option>
            <option value="veryLarge">Very Large (500p)</option>
          </select>
          <button onClick={loadContent}>Load</button>
        </div>

        <div className="button-group">
          <label>Decorations:</label>
          <select value={decorationCount} onChange={e => setDecorationCount(Number(e.target.value) as DecorationCount)}>
            {DECORATION_COUNTS.map(count => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
          <button onClick={addDecorations}>Add</button>
          <button onClick={clearDecorations} disabled={currentDecorationCount === 0}>
            Clear
          </button>
        </div>

        <div className="button-group">
          <label>Test:</label>
          <button onClick={runTypingTest}>Insert Text</button>
        </div>

        <div className="button-group">
          <span>Doc: {docSize.toLocaleString()} chars</span>
          <span>Decorations: {currentDecorationCount.toLocaleString()}</span>
        </div>
      </div>

      <Tiptap instance={editor}>
        <Tiptap.Content />
      </Tiptap>

      {performanceLog.length > 0 && (
        <div className="performance-log">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>Performance Log:</strong>
            <button onClick={clearLog} style={{ fontSize: '11px', padding: '2px 8px' }}>
              Clear
            </button>
          </div>
          {performanceLog.map((entry, index) => (
            <div key={index} className="performance-log-entry">
              {new Date(entry.timestamp).toLocaleTimeString()}: {entry.action} - {entry.duration.toFixed(2)}ms
            </div>
          ))}
        </div>
      )}
    </>
  )
}
