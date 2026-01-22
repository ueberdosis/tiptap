# DibDab Canvas Integration Guide

This guide shows how to integrate DibDab with canvas-based interfaces like node editors, infinite whiteboards, and visual programming environments.

## Basic Canvas Integration

### 1. Create a Canvas Context

```typescript
import { Editor } from '@dibdab/core'
import { createCanvasContext } from '@dibdab/core/extensions'

// Create a canvas context for your editor node
const canvasContext = createCanvasContext({
  nodeId: 'text-node-1',
  nodePosition: { x: 100, y: 200 },
  nodeSize: { width: 400, height: 300 },
  viewport: {
    offset: { x: 0, y: 0 },
    size: { width: window.innerWidth, height: window.innerHeight },
    zoom: 1.0,
  },
  mode: 'edit', // 'edit' | 'pan' | 'select' | 'readonly'
})

// Create editor with canvas context
const editor = new Editor({
  element: document.querySelector('#editor'),
  content: '<p>Hello Canvas World!</p>',
  extensions: [
    // ... your extensions
  ],
})

// Set the canvas context
editor.setCanvasContext(canvasContext)
```

### 2. Update Canvas State

When your canvas viewport changes (pan, zoom), update the editor:

```typescript
// User zooms the canvas
function onCanvasZoom(newZoom: number, mousePos: { x: number; y: number }) {
  editor.updateCanvasZoom(newZoom, mousePos)
}

// User pans the canvas
function onCanvasPan(newOffset: { x: number; y: number }) {
  editor.updateCanvasViewport({ offset: newOffset })
}

// User moves the node
function onNodeMove(newPosition: { x: number; y: number }) {
  editor.updateCanvasNodePosition(newPosition)
}

// User switches to pan mode
function onCanvasModeChange(mode: 'edit' | 'pan' | 'select') {
  editor.updateCanvasMode(mode)
}
```

### 3. Listen to Canvas Events

```typescript
// React to zoom changes
editor.on('canvasZoom', ({ zoom, previousZoom, anchor }) => {
  console.log(`Zoom changed from ${previousZoom} to ${zoom}`)
})

// React to viewport changes
editor.on('canvasViewportChange', ({ viewport, previousViewport }) => {
  console.log('Viewport updated:', viewport)
})

// React to node movement
editor.on('canvasNodeMove', ({ position, previousPosition }) => {
  console.log('Node moved:', position)
})

// React to mode changes
editor.on('canvasModeChange', ({ mode, previousMode }) => {
  console.log(`Mode changed from ${previousMode} to ${mode}`)
})

// React to visibility changes
editor.on('canvasVisibilityChange', ({ isVisible }) => {
  console.log('Editor visible:', isVisible)
})
```

## Using the CanvasAware Extension

The `CanvasAware` extension provides automatic handling of canvas events:

```typescript
import { Editor } from '@dibdab/core'
import { CanvasAware } from '@dibdab/core/extensions'

const editor = new Editor({
  extensions: [
    CanvasAware.configure({
      // Auto-disable editor when canvas is in pan/select mode
      autoDisableOnCanvasMode: true,

      // Handle viewport visibility
      handleVisibility: true,

      // Callbacks
      onVisible: () => {
        console.log('Editor is now visible')
      },
      onHidden: () => {
        console.log('Editor is now hidden')
      },
      onZoomChange: (zoom, previousZoom) => {
        console.log(`Zoom: ${previousZoom} → ${zoom}`)
      },
      onModeChange: (mode, previousMode) => {
        console.log(`Mode: ${previousMode} → ${mode}`)
      },
    }),
    // ... other extensions
  ],
})
```

## Coordinate Transformation

Transform between different coordinate spaces:

```typescript
import { createCoordinateTransform } from '@dibdab/core/helpers/canvasTransform'

const transform = createCoordinateTransform(
  canvasContext.viewport,
  canvasContext.node.position,
  editor.view.dom
)

// Convert screen coordinates to canvas coordinates
const canvasPoint = transform.screenToCanvas({ x: 500, y: 300 })

// Convert canvas coordinates to screen coordinates
const screenPoint = transform.canvasToScreen({ x: 100, y: 200 })

// Convert screen coordinates to editor-local coordinates
const editorPoint = transform.screenToEditor({ x: 500, y: 300 })

// Convert editor-local coordinates to screen coordinates
const screenFromEditor = transform.editorToScreen({ x: 10, y: 20 })
```

## React Integration Example

```tsx
import React, { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@dibdab/react'
import { CanvasAware, createCanvasContext } from '@dibdab/core/extensions'
import StarterKit from '@dibdab/starter-kit'

function CanvasTextNode({
  nodeId,
  position,
  size,
  viewport,
  canvasMode
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CanvasAware.configure({
        autoDisableOnCanvasMode: true,
        handleVisibility: true,
      }),
    ],
    content: '<p>Canvas-aware text node</p>',
  })

  const editorRef = useRef(null)

  // Set up canvas context
  useEffect(() => {
    if (!editor) return

    const context = createCanvasContext({
      nodeId,
      nodePosition: position,
      nodeSize: size,
      viewport,
      mode: canvasMode,
      editorElement: editorRef.current,
    })

    editor.setCanvasContext(context)
  }, [editor, nodeId, position, size, viewport, canvasMode])

  // Update canvas state when props change
  useEffect(() => {
    if (!editor) return
    editor.updateCanvasViewport(viewport)
  }, [editor, viewport])

  useEffect(() => {
    if (!editor) return
    editor.updateCanvasNodePosition(position)
  }, [editor, position])

  useEffect(() => {
    if (!editor) return
    editor.updateCanvasMode(canvasMode)
  }, [editor, canvasMode])

  return (
    <div
      ref={editorRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )
}

export default CanvasTextNode
```

## Utilities

### Checking Visibility

```typescript
import { isRectInViewport, getVisibleRect } from '@dibdab/core/helpers/canvasTransform'

// Check if node is in viewport
const isVisible = isRectInViewport(
  { x: node.position.x, y: node.position.y, width: node.size.width, height: node.size.height },
  viewport
)

// Get visible portion of node
const visibleRect = getVisibleRect(
  { x: node.position.x, y: node.position.y, width: node.size.width, height: node.size.height },
  viewport
)
```

### Point Calculations

```typescript
import {
  distanceBetweenPoints,
  lerpPoints,
  clampPointToRect
} from '@dibdab/core/helpers/canvasTransform'

// Calculate distance
const distance = distanceBetweenPoints(
  { x: 0, y: 0 },
  { x: 100, y: 100 }
) // 141.42...

// Interpolate between points
const midpoint = lerpPoints(
  { x: 0, y: 0 },
  { x: 100, y: 100 },
  0.5
) // { x: 50, y: 50 }

// Clamp point to rectangle
const clamped = clampPointToRect(
  { x: 500, y: 500 },
  { x: 0, y: 0, width: 100, height: 100 }
) // { x: 100, y: 100 }
```

## Best Practices

### 1. Update Canvas Context Efficiently

Only update what changed:

```typescript
// ✅ Good - only update zoom
editor.updateCanvasZoom(newZoom)

// ❌ Avoid - creates new context
editor.setCanvasContext(newContext)
```

### 2. Handle Mode Changes

Disable the editor during canvas pan/select:

```typescript
editor.on('canvasModeChange', ({ mode }) => {
  if (mode === 'pan' || mode === 'select') {
    // Editor is automatically disabled by CanvasAware extension
    // You might want to add visual feedback
    editorElement.style.pointerEvents = 'none'
  } else {
    editorElement.style.pointerEvents = 'auto'
  }
})
```

### 3. Optimize for Large Canvases

Only render editors that are visible:

```typescript
editor.on('canvasVisibilityChange', ({ isVisible }) => {
  if (!isVisible) {
    // Optionally unmount or hide the editor
    editor.unmount()
  } else {
    // Remount when visible
    editor.mount(element)
  }
})
```

## TypeScript Types

```typescript
import type {
  CanvasContext,
  CanvasMode,
  Viewport,
  Point,
  Size,
  Rect
} from '@dibdab/core/types/canvas'

// Type-safe canvas integration
const context: CanvasContext = {
  viewport: {
    offset: { x: 0, y: 0 },
    size: { width: 1920, height: 1080 },
    zoom: 1.0,
  },
  node: {
    id: 'node-1',
    position: { x: 100, y: 200 },
    size: { width: 400, height: 300 },
  },
  mode: 'edit' as CanvasMode,
  // ... transform and methods
}
```

## Advanced: Custom Canvas Extensions

Create your own canvas-aware extensions:

```typescript
import { Extension } from '@dibdab/core'

const MyCanvasExtension = Extension.create({
  name: 'myCanvasExtension',

  onCreate() {
    // Listen to canvas events
    this.editor.on('canvasZoom', ({ zoom }) => {
      // Adjust editor behavior based on zoom
      if (zoom < 0.5) {
        // Maybe disable certain features at low zoom
      }
    })
  },

  addProseMirrorPlugins() {
    return [
      // Add custom plugins that use canvas context
      new Plugin({
        view() {
          return {
            update(view) {
              const context = view.editor?.canvasContext
              if (context) {
                // Use canvas context in your plugin
              }
            }
          }
        }
      })
    ]
  },
})
```

## Next Steps

- **Explore the demos** in `/demos` directory
- **Read the architecture docs** in `ARCHITECTURE.md`
- **Check the roadmap** in `DIBDAB_ROADMAP.md`
- **Contribute** canvas-aware features!

## Support

DibDab is built for canvas-aware editing. If you're building a canvas-based tool and need help integrating DibDab, check out our examples or open an issue!
