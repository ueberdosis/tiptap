// @vitest-environment happy-dom

import { Editor, type Extensions, Node } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { expect, it } from 'vite-plus/test'

import { getEditorContext } from './get-editor-context.js'
import type { JsonItem, SerializedJsonItem } from './types/json-item.js'

// Nodes with the names and attributes of the Diagrams extension's nodes
const diagramsNodes = [
  Node.create({
    name: 'chart',
    group: 'block',
    atom: true,
    addAttributes: () => ({ data: { default: null }, spec: { default: null } }),
  }),
  Node.create({
    name: 'flowDiagram',
    group: 'block',
    atom: true,
    addAttributes: () => ({ format: { default: 'mermaid' }, source: { default: '' } }),
  }),
]

const builtInChartTypes = [
  'line',
  'bar',
  'area',
  'scatter',
  'pie',
  'doughnut',
  'matrix',
  'radar',
  'funnel',
  'gauge',
  'treemap',
  'combo',
  'tree',
  'sankey',
  'network',
]

interface ItemsOfOptions {
  extensions: Extensions
  customNodes?: JsonItem[]
}

function itemsOf({ extensions, customNodes }: ItemsOfOptions): SerializedJsonItem[] {
  const editor = new Editor({ element: null, extensions: [StarterKit, ...extensions] })
  try {
    return getEditorContext(editor, { customNodes }).items
  } finally {
    editor.destroy()
  }
}

function itemNamed(items: SerializedJsonItem[], extensionName: string) {
  return items.find(item => item.extensionName === extensionName)
}

it('describes charts and diagrams in an editor with the Diagrams nodes', () => {
  const items = itemsOf({ extensions: diagramsNodes })
  const chart = itemNamed(items, 'chart')
  const diagram = itemNamed(items, 'flowDiagram')

  expect(chart?.name).toBe('Chart')
  expect(chart?.attributes).toMatchObject({
    properties: { data: { type: 'object' }, spec: { type: 'object' } },
    required: ['data', 'spec'],
  })
  expect(diagram?.name).toBe('Diagram')
  expect(diagram?.attributes).toMatchObject({ required: ['source'] })
})

it('names every built-in chart type and the table that a linked chart follows', () => {
  const chart = itemNamed(itemsOf({ extensions: diagramsNodes }), 'chart')

  for (const type of builtInChartTypes) {
    expect(chart?.description).toMatch(new RegExp(`\\b${type}\\b`))
  }
  expect(chart?.description).toContain('chartTableId')
})

it('keeps the chart spec fields that the schema does not list', () => {
  const chart = itemNamed(itemsOf({ extensions: diagramsNodes }), 'chart')

  expect(chart?.attributes).toMatchObject({
    properties: { spec: { additionalProperties: {} } },
  })
})

it('leaves charts and diagrams out of an editor without them', () => {
  const items = itemsOf({ extensions: [] })

  expect(itemNamed(items, 'chart')).toBeUndefined()
  expect(itemNamed(items, 'flowDiagram')).toBeUndefined()
})

it('leaves the Diagrams description out for an app node that is only named chart', () => {
  const appChart = Node.create({
    name: 'chart',
    group: 'block',
    atom: true,
    addAttributes: () => ({ values: { default: [] } }),
  })

  expect(itemNamed(itemsOf({ extensions: [appChart] }), 'chart')).toBeUndefined()
})

it('uses the item an app passes for a chart instead of the default', () => {
  const items = itemsOf({
    extensions: diagramsNodes,
    customNodes: [{ extensionName: 'chart', name: 'Sales chart' }],
  })

  expect(itemNamed(items, 'chart')).toEqual({ extensionName: 'chart', name: 'Sales chart' })
  expect(itemNamed(items, 'flowDiagram')?.name).toBe('Diagram')
})
