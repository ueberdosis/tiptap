# Phase 3 Advanced Canvas Features

This document covers all the advanced canvas features implemented in Phase 3 of DibDab development.

## Table of Contents

- [Overview](#overview)
- [Extensions](#extensions)
  - [CanvasPointerEvents](#canvaspointerevents)
  - [CanvasViewportCulling](#canvasviewportculling)
  - [CanvasDragDrop](#canvasdragdrop)
  - [CanvasSelection](#canvasselection)
  - [CanvasKeyboard](#canvaskeyboard)
- [Helpers](#helpers)
  - [CanvasFocusManager](#canvasfocusmanager)
  - [Cached Coordinate Transform](#cached-coordinate-transform)
- [React Hooks](#react-hooks)
  - [useCanvasEditor](#usecanvaseditor)
  - [useCanvasFocusManager](#usecanvasfocusmanager)
  - [useCanvasViewport](#usecanvasviewport)
- [Complete Examples](#complete-examples)

---

## Overview

Phase 3 introduces advanced canvas features that enable:

- **Canvas-aware pointer handling** - Transform pointer events to canvas coordinates
- **Performance optimization** - Viewport culling for large canvases
- **Multi-editor interactions** - Drag & drop, selection, focus management
- **Spatial navigation** - Keyboard shortcuts for moving between editors
- **React integration** - Hooks for canvas-aware editors

All features are designed to work seamlessly with the Phase 2 canvas context system.

---

## Extensions

### CanvasPointerEvents

Intercepts pointer events and provides canvas-aware event data with coordinate transformations.

#### Installation

```typescript
import { Editor } from '@dibdab/core'
import { CanvasPointerEvents } from '@dibdab/core'

const editor = new Editor({
  extensions: [
    CanvasPointerEvents.configure({
      onPointerDown: (data) => {
        console.log('Clicked at canvas position:', data.canvasPoint)
      },
      onPointerMove: (data) => {
        console.log('Moving at canvas position:', data.canvasPoint)
      }
    })
  ]
})
```

#### Options

```typescript
interface CanvasPointerEventsOptions {
  enabled: boolean                // Enable/disable the extension (default: true)
  stopPropagation: boolean        // Stop event propagation (default: false)
  preventDefault: boolean         // Prevent default behavior (default: false)
  onPointerDown?: (data: CanvasPointerEventData) => boolean | void
  onPointerMove?: (data: CanvasPointerEventData) => boolean | void
  onPointerUp?: (data: CanvasPointerEventData) => boolean | void
  onPointerEnter?: (data: CanvasPointerEventData) => boolean | void
  onPointerLeave?: (data: CanvasPointerEventData) => boolean | void
  onClick?: (data: CanvasPointerEventData) => boolean | void
  onDoubleClick?: (data: CanvasPointerEventData) => boolean | void
}
```

#### Event Data

```typescript
interface CanvasPointerEventData {
  screenPoint: Point              // Screen coordinates
  canvasPoint: Point              // Canvas coordinates
  editorPoint: Point              // Editor-local coordinates
  originalEvent: PointerEvent     // Original DOM event
  canvasContext: CanvasContext    // Current canvas context
  editorElement: HTMLElement      // Editor DOM element
}
```

#### Example: Custom Drawing

```typescript
const editor = new Editor({
  extensions: [
    CanvasPointerEvents.configure({
      onPointerDown: ({ canvasPoint, originalEvent }) => {
        if (originalEvent.shiftKey) {
          // Start drawing at canvas coordinates
          startDrawing(canvasPoint)
          return true // Prevent default editor behavior
        }
      }
    })
  ]
})
```

---

### CanvasViewportCulling

Automatically hide/disable editors outside the visible viewport for better performance.

#### Installation

```typescript
import { CanvasViewportCulling } from '@dibdab/core'

const editor = new Editor({
  extensions: [
    CanvasViewportCulling.configure({
      viewportBuffer: 200,      // Render editors within 200px of viewport
      debounce: true,           // Debounce viewport updates
      debounceDelay: 150,       // Debounce delay in ms
      hideWhenCulled: true,     // Hide DOM element when culled
      disableWhenCulled: false, // Don't disable editor when culled
    })
  ]
})
```

#### Options

```typescript
interface CanvasViewportCullingOptions {
  enabled: boolean                // Enable viewport culling (default: true)
  viewportBuffer: number          // Buffer around viewport in pixels (default: 100)
  debounce: boolean               // Debounce viewport updates (default: true)
  debounceDelay: number           // Debounce delay in ms (default: 150)
  hideWhenCulled: boolean         // Hide element when culled (default: true)
  disableWhenCulled: boolean      // Disable editor when culled (default: false)
  onVisible?: () => void          // Called when editor becomes visible
  onHidden?: () => void           // Called when editor becomes hidden
}
```

#### Commands

```typescript
// Check visibility status
editor.commands.checkVisibility()

// Force immediate visibility check (bypasses debouncing)
editor.commands.forceVisibilityCheck()

// Get current visibility state
const isVisible = editor.commands.isEditorVisible()
```

#### Example: Lazy Loading

```typescript
const editor = new Editor({
  extensions: [
    CanvasViewportCulling.configure({
      viewportBuffer: 300,
      onVisible: () => {
        // Load expensive content when editor becomes visible
        loadHeavyContent()
      },
      onHidden: () => {
        // Clean up resources when editor is hidden
        unloadHeavyContent()
      }
    })
  ]
})
```

---

### CanvasDragDrop

Enable drag and drop between editors on the same canvas.

#### Installation

```typescript
import { CanvasDragDrop } from '@dibdab/core'

const editor = new Editor({
  extensions: [
    CanvasDragDrop.configure({
      allowCrossEditorDrag: true,
      onDrop: (data) => {
        console.log('Dropped content from', data.sourceEditor, 'to', data.targetEditor)
        console.log('Canvas coordinates:', data.targetCanvasPoint)
      }
    })
  ]
})
```

#### Options

```typescript
interface CanvasDragDropOptions {
  enabled: boolean                        // Enable drag and drop (default: true)
  allowCrossEditorDrag: boolean          // Allow dragging between editors (default: true)
  showDragPreview: boolean               // Show drag preview (default: true)
  onDragStart?: (data: DragDropData) => void
  onDragOver?: (data: DragDropData) => boolean | void
  onDrop?: (data: DragDropData) => boolean | void
  onDragEnd?: (data: DragDropData) => void
  serializeDragData?: (content: any) => string
  deserializeDragData?: (dataTransfer: DataTransfer) => any
}
```

#### Drag Data

```typescript
interface DragDropData {
  sourceEditor: Editor | null         // Editor where drag started
  targetEditor: Editor | null         // Editor where drop occurred
  content: any                        // Dragged content
  sourceCanvasPoint: Point | null     // Start position in canvas coordinates
  targetCanvasPoint: Point | null     // Drop position in canvas coordinates
  dataTransfer: DataTransfer          // Browser DataTransfer object
  event: DragEvent                    // Original drag event
}
```

#### Example: Custom Drag Handling

```typescript
const editor = new Editor({
  extensions: [
    CanvasDragDrop.configure({
      onDrop: ({ sourceEditor, targetEditor, content, targetCanvasPoint }) => {
        if (sourceEditor !== targetEditor) {
          // Cross-editor drag
          targetEditor.commands.insertContentAt(
            targetEditor.state.selection.to,
            content
          )
          return true // Prevent default behavior
        }
      }
    })
  ]
})
```

---

### CanvasSelection

Multi-editor selection with keyboard shortcuts.

#### Installation

```typescript
import { CanvasSelection } from '@dibdab/core'

const editor = new Editor({
  extensions: [
    CanvasSelection.configure({
      allowCrossEditorSelection: true,
      onSelectionChange: (selections) => {
        console.log('Selected in', selections.length, 'editors')
      }
    })
  ]
})
```

#### Options

```typescript
interface CanvasSelectionOptions {
  enabled: boolean                        // Enable multi-editor selection (default: true)
  allowCrossEditorSelection: boolean     // Allow selection across editors (default: true)
  selectionClass: string                 // CSS class for selected content (default: 'canvas-multi-selection')
  onSelectionChange?: (selections: SelectionRange[]) => void
  onCrossEditorSelectionStart?: (editor: Editor) => void
  onCrossEditorSelectionEnd?: (selections: SelectionRange[]) => void
}
```

#### Commands

```typescript
// Add selection to multi-editor selection
editor.commands.addSelection(editor, from, to)

// Remove selection
editor.commands.removeSelection(editor)

// Clear all selections
editor.commands.clearSelections()

// Get all selections
const selections = editor.commands.getSelections()

// Check if multi-selecting
const isMultiSelecting = editor.commands.isMultiSelecting()

// Start/end cross-editor selection mode
editor.commands.startCrossEditorSelection()
editor.commands.endCrossEditorSelection()

// Copy/delete multi-selection
editor.commands.copyMultiSelection()
editor.commands.deleteMultiSelection()
```

#### Keyboard Shortcuts

- `Cmd/Ctrl+C` - Copy multi-selection
- `Backspace/Delete` - Delete multi-selection
- `Escape` - Clear multi-selection

#### Example: Custom Selection UI

```typescript
const editor = new Editor({
  extensions: [
    CanvasSelection.configure({
      selectionClass: 'my-custom-selection',
      onSelectionChange: (selections) => {
        // Update UI to show selected editors
        updateSelectionUI(selections)
      }
    })
  ]
})
```

---

### CanvasKeyboard

Canvas-aware keyboard shortcuts and spatial navigation.

#### Installation

```typescript
import { CanvasKeyboard } from '@dibdab/core'

const editor = new Editor({
  extensions: [
    CanvasKeyboard.configure({
      enableSpatialNavigation: true,
      onSpatialNavigate: (direction, editor) => {
        // Find editor in the given direction
        return findEditorInDirection(direction, editor)
      }
    })
  ]
})
```

#### Options

```typescript
interface CanvasKeyboardOptions {
  enabled: boolean                           // Enable keyboard shortcuts (default: true)
  enableSpatialNavigation: boolean          // Enable arrow key navigation (default: true)
  enableModeShortcuts: boolean              // Enable canvas mode shortcuts (default: true)
  shortcuts?: Record<string, (editor: Editor) => boolean>  // Custom shortcuts
  onSpatialNavigate?: (direction: 'up' | 'down' | 'left' | 'right', editor: Editor) => Editor | null
  onModeChange?: (mode: CanvasMode, previousMode: CanvasMode) => void
}
```

#### Built-in Shortcuts

**Spatial Navigation:**
- `Ctrl+Alt+ArrowUp` - Navigate to editor above
- `Ctrl+Alt+ArrowDown` - Navigate to editor below
- `Ctrl+Alt+ArrowLeft` - Navigate to editor on left
- `Ctrl+Alt+ArrowRight` - Navigate to editor on right

**Canvas Modes:**
- `Ctrl+Shift+E` - Toggle edit mode
- `Ctrl+Shift+R` - Set readonly mode
- `Ctrl+Shift+P` - Set pan mode
- `Ctrl+Shift+S` - Set select mode

#### Commands

```typescript
// Navigate in a direction
editor.commands.navigateToEditor('up' | 'down' | 'left' | 'right')

// Toggle edit mode
editor.commands.toggleCanvasEditMode()

// Set canvas mode
editor.commands.setCanvasMode('edit' | 'readonly' | 'pan' | 'select')
```

#### Example: Custom Shortcuts

```typescript
const editor = new Editor({
  extensions: [
    CanvasKeyboard.configure({
      shortcuts: {
        // Custom shortcut: Ctrl+Shift+C to copy canvas coordinates
        'Ctrl-Shift-c': (editor) => {
          const coords = editor.canvasContext?.node.position
          if (coords) {
            navigator.clipboard.writeText(JSON.stringify(coords))
            return true
          }
          return false
        }
      }
    })
  ]
})
```

---

## Helpers

### CanvasFocusManager

Manage focus across multiple editors on a canvas.

#### Usage

```typescript
import { createCanvasFocusManager } from '@dibdab/core'

const focusManager = createCanvasFocusManager({
  autoFocus: true,
  exclusiveFocus: true,
  onFocusChange: (editor, previousEditor) => {
    console.log('Focus changed from', previousEditor, 'to', editor)
  }
})

// Register editors
focusManager.registerEditor(editor1)
focusManager.registerEditor(editor2)

// Focus an editor
focusManager.setFocusedEditor(editor1)

// Navigate between editors
focusManager.focusNext()
focusManager.focusPrevious()

// Get visible editors
const visibleEditors = focusManager.getVisibleEditors()

// Clean up
focusManager.destroy()
```

#### API

```typescript
class CanvasFocusManager {
  registerEditor(editor: Editor): void
  unregisterEditor(editor: Editor | string): void
  setFocusedEditor(editor: Editor | string | null): void
  getFocusedEditor(): Editor | null
  getEditor(nodeId: string): Editor | undefined
  getAllEditors(): Editor[]
  getVisibleEditors(): Editor[]
  focusNext(): void
  focusPrevious(): void
  blurAll(): void
  destroy(): void
}
```

---

### Cached Coordinate Transform

Performance-optimized coordinate transformation with caching.

#### Usage

```typescript
import { createCachedCoordinateTransform } from '@dibdab/core'

const cachedTransform = createCachedCoordinateTransform(editorElement)

// Update transform when viewport/position changes
cachedTransform.update(viewport, nodePosition)

// Use the cached transform
const canvasPoint = cachedTransform.transform.screenToCanvas({ x: 100, y: 200 })
const screenPoint = cachedTransform.transform.canvasToScreen({ x: 50, y: 75 })
```

The cached transform only recreates the transformation functions when the viewport or node position actually changes, improving performance for frequent coordinate conversions.

---

## React Hooks

### useCanvasEditor

React hook for creating canvas-aware editors.

#### Usage

```typescript
import { useCanvasEditor } from '@dibdab/react'
import { EditorContent } from '@dibdab/react'

function CanvasNode({ nodeId, position, size }) {
  const { editor, editorRef, updateViewport, updateZoom } = useCanvasEditor({
    nodeId,
    nodePosition: position,
    nodeSize: size,
    extensions: [
      // Your extensions
    ],
    onViewportChange: (viewport) => {
      console.log('Viewport changed:', viewport)
    }
  })

  return (
    <div ref={editorRef}>
      <EditorContent editor={editor} />
    </div>
  )
}
```

#### Options

```typescript
interface UseCanvasEditorOptions extends UseEditorOptions {
  canvasContext?: CanvasContext               // Initial canvas context
  nodeId: string                              // Canvas node ID (required)
  nodePosition?: Point                        // Initial position (default: {x:0,y:0})
  nodeSize?: { width: number; height: number } // Initial size (default: {width:400,height:300})
  initialMode?: CanvasMode                    // Initial mode (default: 'edit')
  onViewportChange?: (viewport: Viewport) => void
  onZoomChange?: (zoom: number, previousZoom: number) => void
  onModeChange?: (mode: CanvasMode, previousMode: CanvasMode) => void
  onNodeMove?: (position: Point, previousPosition: Point) => void
  onVisibilityChange?: (isVisible: boolean) => void
}
```

#### Return Value

```typescript
{
  editor: Editor | null                      // Editor instance
  editorRef: RefObject<HTMLDivElement>       // Ref for editor element
  canvasContext: CanvasContext | null        // Current canvas context
  updateViewport: (viewport: Partial<Viewport>) => void
  updateZoom: (zoom: number, anchor?: Point) => void
  updateMode: (mode: CanvasMode) => void
  updateNodePosition: (position: Point) => void
  updateVisibility: (isVisible: boolean) => void
}
```

---

### useCanvasFocusManager

React hook for managing focus across multiple editors.

#### Usage

```typescript
import { useCanvasFocusManager } from '@dibdab/react'

function Canvas() {
  const {
    registerEditor,
    setFocus,
    focusNext,
    focusPrevious,
    focusedEditor,
    registeredEditors
  } = useCanvasFocusManager({
    autoFocus: true,
    exclusiveFocus: true,
    onFocusChange: (editor, prev) => {
      console.log('Focus changed')
    }
  })

  // Register editors as they mount
  useEffect(() => {
    registerEditor(editor)
    return () => unregisterEditor(editor)
  }, [editor])

  return (
    <div>
      <button onClick={focusNext}>Next Editor</button>
      <button onClick={focusPrevious}>Previous Editor</button>
      <div>Focused: {focusedEditor?.canvasContext?.node.id}</div>
    </div>
  )
}
```

---

### useCanvasViewport

React hook for managing canvas viewport state.

#### Usage

```typescript
import { useCanvasViewport } from '@dibdab/react'

function Canvas() {
  const {
    viewport,
    pan,
    zoomIn,
    zoomOut,
    setZoom,
    centerOn,
    fitRect,
    reset
  } = useCanvasViewport({
    minZoom: 0.1,
    maxZoom: 5,
    onChange: (viewport) => {
      // Update all editors with new viewport
      editors.forEach(ed => ed.updateCanvasViewport(viewport))
    }
  })

  return (
    <div>
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
      <button onClick={reset}>Reset View</button>
      <div>Zoom: {viewport.zoom.toFixed(2)}x</div>
    </div>
  )
}
```

#### API

```typescript
{
  viewport: Viewport                                    // Current viewport
  updateViewport: (updates: Partial<Viewport>) => void // Update viewport
  pan: (delta: Point) => void                          // Pan by delta
  zoomIn: (anchor?: Point) => void                     // Zoom in
  zoomOut: (anchor?: Point) => void                    // Zoom out
  setZoom: (zoom: number, anchor?: Point) => void      // Set zoom level
  centerOn: (point: Point) => void                     // Center on point
  fitRect: (rect, padding?) => void                    // Fit rect in viewport
  reset: () => void                                    // Reset to initial viewport
}
```

---

## Complete Examples

### Example 1: Canvas with Multiple Editors

```typescript
import { useCanvasEditor, useCanvasFocusManager, useCanvasViewport } from '@dibdab/react'
import { EditorContent } from '@dibdab/react'
import {
  CanvasPointerEvents,
  CanvasViewportCulling,
  CanvasDragDrop,
  CanvasSelection,
  CanvasKeyboard
} from '@dibdab/core'

function CanvasEditor({ nodeId, position, size }) {
  const focusManager = useCanvasFocusManager()

  const { editor, editorRef } = useCanvasEditor({
    nodeId,
    nodePosition: position,
    nodeSize: size,
    extensions: [
      CanvasPointerEvents,
      CanvasViewportCulling.configure({ viewportBuffer: 200 }),
      CanvasDragDrop,
      CanvasSelection,
      CanvasKeyboard.configure({
        onSpatialNavigate: (direction, editor) => {
          // Find editor in direction and return it
          return findNearestEditor(editor, direction)
        }
      })
    ]
  })

  useEffect(() => {
    if (editor) {
      focusManager.registerEditor(editor)
      return () => focusManager.unregisterEditor(editor)
    }
  }, [editor])

  return (
    <div ref={editorRef} style={{ position: 'absolute', left: position.x, top: position.y }}>
      <EditorContent editor={editor} />
    </div>
  )
}

function Canvas() {
  const { viewport, pan, zoomIn, zoomOut } = useCanvasViewport()

  const nodes = [
    { id: 'node-1', position: { x: 100, y: 100 }, size: { width: 400, height: 300 } },
    { id: 'node-2', position: { x: 600, y: 100 }, size: { width: 400, height: 300 } },
    { id: 'node-3', position: { x: 100, y: 500 }, size: { width: 400, height: 300 } },
  ]

  return (
    <div className="canvas">
      <div className="toolbar">
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
      </div>

      <div
        className="canvas-viewport"
        style={{ transform: `translate(${viewport.offset.x}px, ${viewport.offset.y}px) scale(${viewport.zoom})` }}
      >
        {nodes.map(node => (
          <CanvasEditor
            key={node.id}
            nodeId={node.id}
            position={node.position}
            size={node.size}
          />
        ))}
      </div>
    </div>
  )
}
```

### Example 2: Performance-Optimized Canvas

```typescript
import { useCanvasEditor, useCanvasViewport } from '@dibdab/react'
import { CanvasViewportCulling } from '@dibdab/core'

function OptimizedCanvas() {
  const { viewport } = useCanvasViewport({
    debounce: true,
    debounceDelay: 100
  })

  // 100 editors on canvas
  const nodes = Array.from({ length: 100 }, (_, i) => ({
    id: `node-${i}`,
    position: { x: (i % 10) * 500, y: Math.floor(i / 10) * 400 }
  }))

  return (
    <div>
      {nodes.map(node => (
        <CanvasEditor
          key={node.id}
          nodeId={node.id}
          position={node.position}
          extensions={[
            // Only render visible editors
            CanvasViewportCulling.configure({
              viewportBuffer: 300,
              hideWhenCulled: true,
              disableWhenCulled: true
            })
          ]}
        />
      ))}
    </div>
  )
}
```

---

## Performance Considerations

### Viewport Culling

- Use `CanvasViewportCulling` for canvases with >10 editors
- Adjust `viewportBuffer` based on your canvas size
- Enable `disableWhenCulled` for maximum performance

### Coordinate Transform Caching

- Use `createCachedCoordinateTransform` for frequent coordinate conversions
- Especially useful in `onPointerMove` handlers

### Debouncing

- Enable debouncing for viewport updates (150ms default)
- Reduces re-renders during panning/zooming

---

## Next Steps

1. **Build a demo application** - See canvas features in action
2. **Create custom extensions** - Extend canvas functionality
3. **Optimize for your use case** - Tune performance settings
4. **Add tests** - Ensure reliability

For more information, see:
- [CANVAS_USAGE.md](./CANVAS_USAGE.md) - Phase 2 canvas basics
- [DIBDAB_ROADMAP.md](./DIBDAB_ROADMAP.md) - Project roadmap
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Codebase architecture
