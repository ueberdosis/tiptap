# Tiptap/DibDab Architecture Map

> **Generated**: 2026-01-22
> **Purpose**: Deep dive into Tiptap's architecture before we transform it into DibDab

---

## TIPTAP CODEBASE ARCHITECTURE MAP

### 1. CORE ARCHITECTURE

#### Main Entry Points & Exports
**File: `/packages/core/src/index.ts`**

The core package exports:
- `Editor` - Main editor class
- `Extension`, `Node`, `Mark` - Extension base classes
- `ExtensionManager`, `CommandManager` - Manager classes
- Helpers, utilities, and type definitions
- JSX runtime support

#### Editor Class Structure
**File: `/packages/core/src/Editor.ts` (~800 lines)**

Key responsibilities:
- **Initialization**: Takes EditorOptions, creates extension manager, schema, and command manager
- **State Management**:
  - `editorState: EditorState` - ProseMirror state
  - `editorView: EditorView | null` - ProseMirror view
  - `extensionStorage: Storage` - Per-extension storage
- **Lifecycle Events**: beforeCreate → mount → create → update → destroy
- **Key Methods**:
  - `mount(el)` - Attach to DOM (creates EditorView)
  - `unmount()` - Detach from DOM
  - `setOptions()` - Update options dynamically
  - `dispatchTransaction()` - Transaction processing pipeline
  - `registerPlugin()` / `unregisterPlugin()` - Plugin management
  - `getHTML()`, `getJSON()`, `getText()` - Content export
  - `commands`, `chain()`, `can()` - Command execution APIs
- **Event System**: Extends EventEmitter, emits 10+ event types (update, transaction, focus, blur, etc.)

#### Plugin System Architecture
**File: `/packages/core/src/ExtensionManager.ts` (~400 lines)**

**Extension Resolution Pipeline**:
```
User Extensions Input
         ↓
resolveExtensions() [flatten + resolve nested]
         ↓
sortExtensions() [by priority]
         ↓
getSchemaByResolvedExtensions() [build ProseMirror schema]
         ↓
setupExtensions() [initialize storages + bind listeners]
```

**ExtensionManager creates**:
- **Schema**: Built from Node and Mark extensions
- **Plugins**: From keyboard shortcuts, input rules, paste rules, custom plugins
- **NodeViews**: Custom DOM renderers for nodes
- **MarkViews**: Custom DOM renderers for marks
- **Commands**: Aggregated from all extensions
- **dispatchTransaction Pipeline**: Composed from extensions with reduceRight pattern

#### Extension System Architecture
**File: `/packages/core/src/Extendable.ts` (~550 lines)**

**ExtendableConfig interface** defines all extension capabilities:

```
Extension Methods (via addXXX):
├── addOptions() → Options object
├── addStorage() → Storage object
├── addCommands() → Command functions
├── addKeyboardShortcuts() → Keyboard handlers
├── addInputRules() → Auto-transformation on typing
├── addPasteRules() → Auto-transformation on paste
├── addProseMirrorPlugins() → Raw ProseMirror plugins
├── addGlobalAttributes() → Attributes for other nodes
└── addExtensions() → Sub-extensions

Extension Lifecycle Hooks:
├── onBeforeCreate() → Before initialization
├── onCreate() → After initialization
├── onUpdate() → Document changed
├── onTransaction() → Any transaction
├── onSelectionUpdate() → Selection changed
├── onFocus() / onBlur() → Focus events
└── onDestroy() → Cleanup

Extension Configuration:
├── parseHTML() [for nodes/marks]
├── renderHTML() [DOM generation]
├── parseMarkdown()
├── renderMarkdown()
├── extendNodeSchema() [extend other nodes]
└── extendMarkSchema() [extend other marks]
```

**Extendable Base Class Pattern**:
- `configure()` - Merge options, return new instance
- `extend()` - Create child extension, maintain parent chain
- `options` getter - Resolved with parent chain merging
- `storage` getter - Resolved with parent chain merging

#### Command System Architecture
**File: `/packages/core/src/CommandManager.ts` (~140 lines)**

**Three Command Modes**:

1. **Single Commands** (`editor.commands.setHeading()`)
   - Direct execution, dispatches transaction

2. **Chained Commands** (`editor.chain().setHeading().focus().run()`)
   - Collects commands in sequence
   - Single dispatch on `run()`
   - Callbacks track success

3. **Check Commands** (`editor.can().setHeading()`)
   - No dispatch, returns boolean
   - Can chain with `.chain()`

**Command Execution Flow**:
```
Command Call
   ↓
buildProps() [create CommandProps]
   ↓
command(...args)(props) [execute with props]
   ↓
transaction.steps.push() [append to tr]
   ↓
view.dispatch(tr) [if not shouldDispatch=false]
```

---

### 2. PROSEMIRROR INTEGRATION

#### How Tiptap Wraps ProseMirror

**File: `/packages/pm/package.json`**

Tiptap wraps 12 ProseMirror packages:
```
prosemirror-model        → Schema, Nodes, Marks
prosemirror-state        → EditorState, Selection, Transaction
prosemirror-view         → EditorView, NodeView, decoration
prosemirror-transform    → Transform, Step operations
prosemirror-commands     → Built-in commands
prosemirror-keymap       → Keyboard binding
prosemirror-inputrules   → Input rule plugin
prosemirror-history      → Undo/redo
prosemirror-collab       → Collaborative editing
prosemirror-tables       → Table support
prosemirror-markdown     → Markdown support
prosemirror-dropcursor   → Drop cursor visualization
prosemirror-gapcursor    → Gap cursor support
```

Exposed via exports: `@dibdab/pm/model`, `@dibdab/pm/state`, `@dibdab/pm/view`, etc.

#### Key Integration Points

**1. Schema Creation**
**File: `/packages/core/src/helpers/getSchemaByResolvedExtensions.ts` (~200 lines)**

```
Extensions → NodeSpec/MarkSpec objects
   ↓
Extract attributes from all extensions
   ↓
Apply global attributes from other extensions
   ↓
Build ProseMirror Schema
```

Each extension contributes:
- NodeSpec or MarkSpec with parseHTML, renderHTML
- Attributes with default, validate, rendered
- Groups for content expression (block, inline)

**2. View Creation & Dispatching**
**File: `/packages/core/src/Editor.ts` (lines 521-561)**

```
Editor.createView(element) →
   new EditorView(element, {
      state: editorState,
      dispatchTransaction: composed dispatch function,
      nodeViews: extensionManager.nodeViews,
      markViews: extensionManager.markViews,
      editorProps: options.editorProps
   })
```

**3. Transaction Dispatch Pipeline**
**File: `/packages/core/src/Editor.ts` (lines 605-694)**

```
DOM Event → EditorView.dispatch(tr)
   ↓
extensionManager.dispatchTransaction() [extension hook]
   ↓
state.applyTransaction(tr) [ProseMirror processing]
   ↓
emit('beforeTransaction')
   ↓
view.updateState(newState)
   ↓
emit('transaction') → emit('update')
   ↓
emit('selectionUpdate') if selection changed
   ↓
emit('focus'/'blur') if focus state changed
```

#### Event Handling Flow: DOM → ProseMirror → Tiptap

**File: `/packages/core/src/extensions/` (multiple)**

Core extensions handle different event types:

- **Keymap** - `addKeyboardShortcuts()` → ProseMirror keymap plugin → commands
- **Paste** - `handlePaste` prop → emits 'paste' event with slice
- **Drop** - `handleDOMEvents.drop` → emits 'drop' event
- **FocusEvents** - `handleDOMEvents.focus/blur` → emits events
- **Delete** - keyboard handling → `deleteSelection`, `deleteCurrentNode`, etc.

---

### 3. FRAMEWORK ADAPTERS

#### React Adapter
**Location: `/packages/react/src/`**

**useEditor Hook** (`useEditor.ts` - 400 lines)
- Uses `useSyncExternalStore` for subscription management
- `EditorInstanceManager` class handles:
  - Lazy initialization with `immediatelyRender` option
  - Automatic cleanup on unmount
  - Scheduled destruction if not mounted in time
  - Re-creation when dependencies change
  - SSR/Next.js detection
- Returns: `{ editor: Ref<Editor> }`

**EditorContent Component** (`EditorContent.tsx` - 200 lines)
- Mounts editor to ref element on first render
- Uses `useSyncExternalStore` for node view portal updates
- Creates React portals for custom node views
- Handles ref merging for multiple ref types

**Node View Rendering** (`ReactNodeViewRenderer.tsx` - 400 lines)
- Wraps React component as ProseMirror NodeView
- Creates portal container and renders component
- Bridges React component props with NodeView interface
- Handles updates, decorations, content DOM access

**Mark View Rendering** (`ReactMarkViewRenderer.tsx` - 100 lines)
- Similar to NodeViewRenderer but for marks
- Renders mark content through React portal

#### Vue-3 Adapter
**Location: `/packages/vue-3/src/`**

**Simpler than React** - Fewer files, less complexity:

**useEditor Composable** (`useEditor.ts` - 25 lines)
```typescript
export const useEditor = (options) => {
  const editor = shallowRef<Editor>()

  onMounted(() => {
    editor.value = new Editor(options)
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return editor
}
```

**Key Difference**: Vue 3 uses:
- `shallowRef()` instead of `useRef()`
- `onMounted()` / `onBeforeUnmount()` instead of `useEffect()`
- Less external store management (Vue's reactivity handles it)

**Node View Rendering** (`VueNodeViewRenderer.ts` - 250 lines)
- Creates Vue component wrapper
- Uses `h()` to render content
- Simpler portal management than React

#### What Framework Adapters Do vs Core

| Aspect | Core | Adapters |
|--------|------|----------|
| Editor creation | ✓ | Wraps in hooks/composables |
| DOM mounting | ✓ | Handles framework lifecycle |
| State management | ✓ | Uses framework's (React: useSyncExternalStore, Vue: reactivity) |
| Command execution | ✓ | Pass-through |
| Node views | ✓ | Framework-specific portal rendering |
| Type system | ✓ | Add framework types |
| SSR | ✗ | Adapter handles SSR detection |

---

### 4. EXTENSION SYSTEM

#### Example Extension: Bold (Mark)
**File: `/packages/extension-bold/src/bold.tsx` (~160 lines)**

```typescript
export const Bold = Mark.create<BoldOptions>({
  name: 'bold',

  // 1. Options
  addOptions() {
    return { HTMLAttributes: {} }
  },

  // 2. Schema - HTML parsing
  parseHTML() {
    return [
      { tag: 'strong' },
      { tag: 'b' },
      { style: 'font-weight=400', clearMark: ... },
      { style: 'font-weight', getAttrs: ... }
    ]
  },

  // 3. Schema - HTML rendering
  renderHTML({ HTMLAttributes }) {
    return (
      <strong {...mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)}>
        <slot />
      </strong>
    )
  },

  // 4. Markdown
  markdownTokenName: 'strong',
  parseMarkdown: (token, helpers) =>
    helpers.applyMark('bold', helpers.parseInline(token.tokens || [])),
  renderMarkdown: (node, h) => `**${h.renderChildren(node)}**`,

  // 5. Commands
  addCommands() {
    return {
      setBold: () => ({ commands }) => commands.setMark(this.name),
      toggleBold: () => ({ commands }) => commands.toggleMark(this.name),
      unsetBold: () => ({ commands }) => commands.unsetMark(this.name),
    }
  },

  // 6. Keyboard shortcuts
  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
    }
  },

  // 7. Input rules (auto-format on typing)
  addInputRules() {
    return [
      markInputRule({ find: /\*\*(...)\*\*/, type: this.type }),
      markInputRule({ find: /__(..)__/, type: this.type }),
    ]
  },

  // 8. Paste rules (auto-format on paste)
  addPasteRules() {
    return [
      markPasteRule({ find: /\*\*(...)\*\*/, type: this.type }),
      markPasteRule({ find: /__(..)__/, type: this.type }),
    ]
  },
})
```

#### Example Extension: Heading (Node)
**File: `/packages/extension-heading/src/heading.ts` (~150 lines)**

```typescript
export const Heading = Node.create<HeadingOptions>({
  name: 'heading',

  addOptions() {
    return { levels: [1, 2, 3, 4, 5, 6], HTMLAttributes: {} }
  },

  content: 'inline*',        // Can contain inline content
  group: 'block',            // Is a block-level node
  defining: true,            // Defining node

  // Schema - Attributes
  addAttributes() {
    return {
      level: { default: 1, rendered: false }  // Attribute, not rendered in HTML
    }
  },

  // HTML parsing
  parseHTML() {
    return this.options.levels.map(level => ({
      tag: `h${level}`,
      attrs: { level }
    }))
  },

  // HTML rendering
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level
    return [`h${level}`, mergeAttributes(...), 0]  // 0 = content goes here
  },

  // Commands with options
  addCommands() {
    return {
      setHeading: (attributes) => ({ commands }) =>
        commands.setNode(this.name, attributes),
      toggleHeading: (attributes) => ({ commands }) =>
        commands.toggleNode(this.name, 'paragraph', attributes),
    }
  },

  // Keyboard shortcuts with options
  addKeyboardShortcuts() {
    return this.options.levels.reduce((items, level) => ({
      ...items,
      [`Mod-Alt-${level}`]: () => this.editor.commands.toggleHeading({ level })
    }), {})
  },

  // Input rules with configuration
  addInputRules() {
    return this.options.levels.map(level =>
      textblockTypeInputRule({
        find: new RegExp(`^(#{${level}})\\s$`),
        type: this.type,
        getAttributes: { level }
      })
    )
  },
})
```

#### Example Extension: Image (Node with Custom View)
**File: `/packages/extension-image/src/image.ts` (~200 lines)**

```typescript
export const Image = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      resize: false,  // Can be configured with options
      HTMLAttributes: {}
    }
  },

  inline() { return this.options.inline },
  group() { return this.options.inline ? 'inline' : 'block' },
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null }
    }
  },

  addCommands() {
    return {
      setImage: (options) => ({ commands }) =>
        commands.insertContent({
          type: this.name,
          attrs: options
        })
    }
  },

  // Custom node view using ResizableNodeView
  addNodeView() {
    return ReactNodeViewRenderer(ImageView, {
      resize: this.options.resize
    })
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /!\[(.+|:?)]\((\S+)(?:\s+["'](\S+)["'])?\)/,
        type: this.type,
        getAttributes: ([, alt, src, title]) => ({
          src, alt, title
        })
      })
    ]
  }
})
```

#### Extension Lifecycle

**Initialization Order**:
```
1. Extension.create() or Extension.configure()
   ↓
2. Constructor: config merged with defaults
   ↓
3. ExtensionManager resolveExtensions()
   ↓
4. setupExtensions() for each extension:
   - Create storage object
   - Bind lifecycle listeners
   - Collect splitTable marks
   ↓
5. Create schema from extensions
   ↓
6. Create editor state & view
   ↓
7. emit('beforeCreate') from Editor constructor
   ↓
8. emit('mount') when editor.mount() called
   ↓
9. emit('create') after view is ready
```

**Accessing Extension Data**:
```typescript
// In commands, hooks, etc.
this.options          // Extension options (readonly, merged)
this.storage          // Extension storage (mutable)
this.editor           // Editor instance
this.type             // ProseMirror NodeType or MarkType
this.name             // Extension name
this.parent           // Parent extension (if extended)
```

---

### 5. KEY ARCHITECTURAL PATTERNS

#### Pattern 1: Composition over Inheritance
- All extensions compose via `addXXX()` methods
- No deep inheritance chains
- Extensions extend() to create variants
- Parent chain maintained for option merging

#### Pattern 2: Plugin Architecture
- Tiptap provides `addProseMirrorPlugins()` hook
- Direct ProseMirror Plugin integration
- Plugin composition via `reduceRight` for dispatch override

#### Pattern 3: Command Chain Pattern
```typescript
editor
  .chain()
  .setHeading({ level: 1 })
  .focus()
  .run()
```
- Builds transaction in memory
- Single dispatch on run()
- Can branch with can()

#### Pattern 4: Extension Field Resolution
**File: `/packages/core/src/helpers/getExtensionField.ts`**

- Walk parent chain to find method/property
- Merge with parent implementation via `callOrReturn`
- Allows options inheritance and override

#### Pattern 5: Attribute System
- Extensions define attributes via `addAttributes()`
- Global attributes via `addGlobalAttributes()`
- Attributes in ProseMirror schema
- HTML parse rules extract attributes
- HTML render rules apply attributes

---

### 6. KEY FILES RANKING (15 Most Important)

| # | File | Purpose | Lines |
|---|------|---------|-------|
| 1 | `/packages/core/src/Editor.ts` | Main editor class, lifecycle, state management | 802 |
| 2 | `/packages/core/src/ExtensionManager.ts` | Extension resolution, plugin aggregation | 400 |
| 3 | `/packages/core/src/Extendable.ts` | Base extension class, config pattern | 557 |
| 4 | `/packages/core/src/types.ts` | All TypeScript type definitions | 850+ |
| 5 | `/packages/core/src/Node.ts` | Node extension base class | 250+ |
| 6 | `/packages/core/src/Mark.ts` | Mark extension base class | 200+ |
| 7 | `/packages/core/src/CommandManager.ts` | Command execution, chaining, can() | 138 |
| 8 | `/packages/core/src/InputRule.ts` | Input rule plugin & execution | 250+ |
| 9 | `/packages/core/src/PasteRule.ts` | Paste rule plugin & execution | 250+ |
| 10 | `/packages/core/src/helpers/getSchemaByResolvedExtensions.ts` | Schema builder | 200+ |
| 11 | `/packages/core/src/NodeView.ts` | Node view base class | 300+ |
| 12 | `/packages/react/src/useEditor.ts` | React hook with instance manager | 400+ |
| 13 | `/packages/react/src/EditorContent.tsx` | React component, portal management | 200+ |
| 14 | `/packages/vue-3/src/useEditor.ts` | Vue 3 composable | 25 |
| 15 | `/packages/core/src/EventEmitter.ts` | Event pub/sub system | 59 |

---

### 7. EXTENSION TYPES HIERARCHY

```
Extendable (abstract base)
├── Extension (generic plugin)
├── Node (block/inline content)
│   ├── Paragraph, Heading, Blockquote
│   ├── CodeBlock, HorizontalRule
│   ├── Image, Table, ListItem
│   └── Document (top-level)
└── Mark (text styling)
    ├── Bold, Italic, Underline, Strike
    ├── Code, Link, Highlight
    └── Subscript, Superscript, Color
```

**Core Extensions** (always included):
- Editable - Controls editability via plugin
- Keymap - Default keyboard shortcuts (Enter, Backspace, etc.)
- Paste - Emits paste events
- Drop - Emits drop events
- Delete - Delete keyboard handling
- FocusEvents - Focus/blur tracking
- Commands - Registers all extension commands
- ClipboardTextSerializer - Plain text copy
- TextDirection - RTL/LTR support
- Tabindex - Accessibility support

---

### 8. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────┐
│          User Interaction (DOM Events)              │
└────────────────┬────────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  EditorView    │ (ProseMirror)
         │  handleDOMEvents
         └───────┬────────┘
                 │
         ┌───────▼────────────────┐
         │  Plugin Event Handlers     │
         │ (keymap, paste, drop, etc) │
         └───────┬────────────────────┘
                 │
         ┌───────▼──────────────────────────┐
         │  Commands / Input Rules / etc    │
         │  → Creates Transaction (tr)      │
         └───────┬──────────────────────────┘
                 │
         ┌───────▼─────────────────────────────────────┐
         │  editor.dispatchTransaction(tr)             │
         │  → extensionManager.dispatchTransaction()   │
         │  → state.applyTransaction(tr)               │
         │  → emit('beforeTransaction')                │
         └───────┬─────────────────────────────────────┘
                 │
         ┌───────▼──────────────────────────────────────┐
         │  view.updateState(newState)                 │
         │  emit('transaction')                        │
         │  emit('update') if content changed          │
         │  emit('selectionUpdate') if selection       │
         │  emit('focus'/'blur') if focus changed      │
         └───────┬──────────────────────────────────────┘
                 │
         ┌───────▼────────────────────┐
         │  Listeners (subscriptions) │
         │  React components re-render│
         │  Vue watchers update       │
         └────────────────────────────┘
```

---

### 9. SCHEMA GENERATION EXAMPLE

Given extensions: `Document, Paragraph, Bold, Heading`

```javascript
// Step 1: Resolve & sort by priority
extensions = [
  Document (priority 100, topNode: true),
  Paragraph (priority 100),
  Heading (priority 100),
  Bold (priority 100)
]

// Step 2: Split into nodes & marks
nodes = [Document, Paragraph, Heading]
marks = [Bold]

// Step 3: Build NodeSpecs from Node extensions
nodeSpecs = {
  doc: {
    content: 'block+',
    group: undefined
  },
  paragraph: {
    content: 'inline*',
    group: 'block'
  },
  heading: {
    content: 'inline*',
    group: 'block',
    attrs: { level: { default: 1 } }
  }
}

// Step 4: Build MarkSpecs from Mark extensions
markSpecs = {
  bold: {
    parseDOM: [{ tag: 'strong' }, ...],
    toDOM: () => ['strong', 0]
  }
}

// Step 5: Create ProseMirror Schema
schema = new Schema({
  nodes: nodeSpecs,
  marks: markSpecs,
  topNode: 'doc'  // from Document
})
```

---

### 10. SUMMARY: Architecture Strengths

1. **Pluggable**: 50+ extensions with consistent API
2. **Type-Safe**: Comprehensive TypeScript types with generics
3. **Framework-Agnostic**: Core works with React, Vue, or vanilla JS
4. **Composable**: Extensions can be nested and extended
5. **Event-Driven**: Pub/sub for all state changes
6. **ProseMirror-Native**: Direct integration with PM plugins & schema
7. **Command Chaining**: Fluent API for complex operations
8. **Custom Rendering**: NodeViews for complex content
9. **Markdown Support**: Parse/render via extension config
10. **Performance**: Transaction batching, selective re-renders via useSyncExternalStore

This architecture provides a clean abstraction over ProseMirror while maintaining full access to underlying APIs for advanced use cases.

---

## Canvas Integration Points (For DibDab)

Based on this architecture map, here are the key integration points where we'll add canvas awareness:

### 1. Editor Class Enhancement
- Add `CanvasContext` to EditorOptions
- Store canvas state (zoom, viewport, parent node)
- Emit canvas-specific events (zoom, pan, node move)

### 2. New Core Extensions
- **CanvasPointerEvents** - Intercept pointer events, adjust for zoom/pan
- **CanvasKeymap** - Canvas-aware keyboard shortcuts
- **CanvasFocus** - Multi-editor focus management
- **CanvasViewport** - Track and respond to viewport changes

### 3. Framework Adapter Changes
- React: `useCanvasEditor()` hook with canvas context
- Vue: `useCanvasEditor()` composable
- Provide canvas context via React Context / Vue provide/inject

### 4. Extension API Additions
- `addCanvasListeners()` - Subscribe to canvas events
- `onZoomChange()`, `onViewportMove()` - Lifecycle hooks
- `canvasTransform()` - Coordinate transformation helper

This architecture map will serve as our reference as we transform Tiptap into DibDab.
