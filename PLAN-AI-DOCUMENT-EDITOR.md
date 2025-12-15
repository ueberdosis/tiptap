# AI Document Editor Implementation Plan

## Overview

Build a production-ready Editor Fragment for ScyAI that integrates Tiptap as the editor foundation with AI-powered editing capabilities, version control, and chat panel integration.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI DOCUMENT EDITOR FRAGMENT                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         TOOLBAR                                      │   │
│  │  [Bold][Italic][...] | [AI Actions ▼] | [Save Version][Discard]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────┬─────────────────────────────────┐   │
│  │                                   │                                 │   │
│  │         EDITOR AREA               │         CHAT PANEL              │   │
│  │                                   │                                 │   │
│  │  ┌─────────────────────────────┐  │  ┌───────────────────────────┐ │   │
│  │  │                             │  │  │  ScyAI: Ready to help...  │ │   │
│  │  │   Tiptap Editor             │  │  │                           │ │   │
│  │  │   (ProseMirror)             │  │  │  User: Improve paragraph  │ │   │
│  │  │                             │  │  │  3's clarity              │ │   │
│  │  │   [AI Bubble Menu on        │  │  │                           │ │   │
│  │  │    text selection]          │  │  │  ScyAI: [streaming...]    │ │   │
│  │  │                             │  │  │                           │ │   │
│  │  └─────────────────────────────┘  │  ├───────────────────────────┤ │   │
│  │                                   │  │  [Type message...]    ➤   │ │   │
│  │  ┌─────────────────────────────┐  │  └───────────────────────────┘ │   │
│  │  │  Section Progress: 3/8 ✓   │  │                                 │   │
│  │  └─────────────────────────────┘  │                                 │   │
│  │                                   │                                 │   │
│  └───────────────────────────────────┴─────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      VERSION HISTORY BAR                             │   │
│  │  V0 (Draft) → V0.1 (AI Edit) → V0.2 (User Edit) → [Current]        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
demos/src/Examples/AIDocumentEditor/
├── React/
│   ├── index.tsx                    # Main entry point
│   ├── index.html                   # Empty (required for routing)
│   ├── styles.scss                  # Component styles
│   │
│   ├── components/
│   │   ├── AIEditor.tsx             # Main editor wrapper
│   │   ├── Toolbar/
│   │   │   ├── Toolbar.tsx          # Main toolbar component
│   │   │   ├── FormattingButtons.tsx
│   │   │   ├── AIActionsMenu.tsx    # AI action dropdown
│   │   │   └── VersionActions.tsx   # Save/Discard buttons
│   │   │
│   │   ├── BubbleMenu/
│   │   │   ├── AIBubbleMenu.tsx     # Selection-based AI menu
│   │   │   └── AIActionButton.tsx
│   │   │
│   │   ├── ChatPanel/
│   │   │   ├── ChatPanel.tsx        # Main chat container
│   │   │   ├── MessageList.tsx      # Message display
│   │   │   ├── MessageInput.tsx     # User input
│   │   │   └── StreamingMessage.tsx # AI streaming response
│   │   │
│   │   ├── VersionHistory/
│   │   │   ├── VersionBar.tsx       # Version timeline
│   │   │   ├── VersionNode.tsx      # Individual version
│   │   │   └── DiffView.tsx         # Compare versions (post-MVP)
│   │   │
│   │   └── SectionProgress/
│   │       └── SectionProgress.tsx  # Section completion tracker
│   │
│   ├── extensions/
│   │   ├── ai-suggestion.ts         # AI suggestion marks/nodes
│   │   ├── section-tracker.ts       # Section identification
│   │   └── unique-id.ts             # Paragraph tracking
│   │
│   ├── hooks/
│   │   ├── useAI.ts                 # AI API integration
│   │   ├── useVersionControl.ts     # Version management
│   │   ├── useChat.ts               # Chat state
│   │   ├── useEventBus.ts           # ScyAI communication
│   │   └── usePersistence.ts        # IndexedDB persistence
│   │
│   ├── services/
│   │   ├── ai-provider.ts           # AI provider interface
│   │   ├── mock-provider.ts         # Mock for development
│   │   └── event-bus.ts             # Event bus implementation
│   │
│   ├── stores/
│   │   └── editor-store.ts          # Zustand store for state
│   │
│   └── types/
│       └── index.ts                 # TypeScript definitions
│
└── mock-backend/
    ├── main.py                      # FastAPI server
    ├── requirements.txt
    └── README.md
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1-2)

**Goal:** Basic editor with toolbar, no AI yet

**Tasks:**

1. Create folder structure
2. Set up main `index.tsx` with basic Tiptap editor
3. Implement `Toolbar.tsx` with formatting buttons
4. Add basic styling
5. Verify editor renders and basic editing works

**Files:**

- `index.tsx`
- `components/AIEditor.tsx`
- `components/Toolbar/Toolbar.tsx`
- `components/Toolbar/FormattingButtons.tsx`
- `styles.scss`

**Extensions to include:**

```typescript
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import UniqueID from '@tiptap/extension-unique-id'
```

---

### Phase 2: Chat Panel Integration (Day 3-4)

**Goal:** Working chat panel with @assistant-ui/react

**Tasks:**

1. Install `@assistant-ui/react`
2. Create `ChatPanel.tsx` with message list and input
3. Create `useChat.ts` hook for state management
4. Implement split-pane layout (editor | chat)
5. Wire up mock responses (no AI yet)

**Files:**

- `components/ChatPanel/ChatPanel.tsx`
- `components/ChatPanel/MessageList.tsx`
- `components/ChatPanel/MessageInput.tsx`
- `hooks/useChat.ts`

**Key Interface:**

```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  documentReference?: {
    nodeId: string
    text: string
    position: { from: number; to: number }
  }
}

interface UseChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  sendMessage: (content: string, documentContext?: DocumentContext) => Promise<void>
  cancelStream: () => void
}
```

---

### Phase 3: AI Bubble Menu (Day 5-6)

**Goal:** Selection-based AI actions

**Tasks:**

1. Create `AIBubbleMenu.tsx` using Tiptap's BubbleMenu
2. Implement AI action buttons (Improve, Simplify, Expand, etc.)
3. Create `useAI.ts` hook for API calls
4. Implement streaming text insertion
5. Add loading states and error handling

**Files:**

- `components/BubbleMenu/AIBubbleMenu.tsx`
- `components/BubbleMenu/AIActionButton.tsx`
- `hooks/useAI.ts`
- `services/ai-provider.ts`
- `services/mock-provider.ts`

**AI Actions:**

```typescript
type AIAction =
  | 'improve' // Enhance clarity and quality
  | 'simplify' // Make simpler
  | 'expand' // Add more detail
  | 'summarize' // Condense
  | 'fix-grammar' // Fix grammar/spelling
  | 'formal' // Make more formal
  | 'casual' // Make more casual
  | 'translate' // Translate (with language picker)
  | 'custom' // Custom prompt
```

**Streaming Pattern:**

```typescript
async function streamAIEdit(editor: Editor, action: AIAction, selection: { from: number; to: number; text: string }) {
  // 1. Mark selection as "AI editing"
  editor.commands.setMeta('aiEditing', true)

  // 2. Store original for rollback
  const original = selection.text

  // 3. Delete selection and start streaming
  editor.chain().focus().deleteRange(selection).run()

  // 4. Stream chunks
  for await (const chunk of aiProvider.stream(action, original)) {
    editor.commands.insertContent(chunk)
  }

  // 5. Mark complete
  editor.commands.setMeta('aiEditing', false)
}
```

---

### Phase 4: Mock FastAPI Backend (Day 6-7)

**Goal:** Working backend for AI requests

**Tasks:**

1. Create FastAPI server with streaming endpoints
2. Implement mock AI responses with realistic delays
3. Add CORS configuration
4. Create health check endpoint
5. Document API contract

**Files:**

- `mock-backend/main.py`
- `mock-backend/requirements.txt`

**API Endpoints:**

```python
# POST /api/ai/edit
# Request: { action: str, text: str, context?: str }
# Response: SSE stream of text chunks

# POST /api/ai/chat
# Request: { messages: Message[], documentContext?: DocumentContext }
# Response: SSE stream of text chunks

# GET /api/health
# Response: { status: "ok" }
```

**FastAPI Implementation:**

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ai/edit")
async def ai_edit(request: EditRequest):
    async def generate():
        # Mock streaming response
        response = get_mock_response(request.action, request.text)
        for word in response.split():
            yield f"data: {word} \n\n"
            await asyncio.sleep(0.05)
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
```

---

### Phase 5: Chat-to-Document Integration (Day 8-9)

**Goal:** Chat can reference and modify specific document parts

**Tasks:**

1. Implement document context extraction for chat
2. Add "reference selection" feature in chat
3. Implement "Apply to document" from chat response
4. Add visual indicators for referenced sections
5. Handle chat-initiated edits

**Key Features:**

```typescript
// User can reference current selection in chat
const documentContext = {
  currentSelection: editor.state.selection.empty
    ? null
    : {
        text: getSelectedText(editor),
        nodeId: getNodeId(editor.state.selection.from),
        position: {
          from: editor.state.selection.from,
          to: editor.state.selection.to,
        },
      },
  documentOutline: extractOutline(editor.state.doc),
  currentSection: getCurrentSection(editor),
}

// Chat message with reference
interface ChatMessage {
  // ...
  documentReference?: {
    nodeId: string
    text: string
    position: { from: number; to: number }
  }
  suggestedEdit?: {
    original: string
    replacement: string
    targetNodeId: string
  }
}
```

---

### Phase 6: Version Control (Day 10-12)

**Goal:** In-memory version history with IndexedDB persistence

**Tasks:**

1. Create `useVersionControl.ts` hook
2. Implement version snapshots
3. Add Save Version / Discard buttons to toolbar
4. Create `VersionBar.tsx` timeline UI
5. Implement IndexedDB persistence
6. Add version restore capability

**Files:**

- `hooks/useVersionControl.ts`
- `hooks/usePersistence.ts`
- `components/VersionHistory/VersionBar.tsx`
- `components/VersionHistory/VersionNode.tsx`

**Version Model:**

```typescript
interface DocumentVersion {
  id: string
  version: string // "0", "0.1", "0.2", "1.0"
  content: JSONContent // ProseMirror JSON
  createdAt: Date
  createdBy: 'user' | 'ai'
  label?: string // "AI revision", "User edit"
  parentId: string | null // For DAG structure
  metadata: {
    wordCount: number
    sectionState: Record<string, 'pending' | 'complete' | 'in_review'>
  }
}

interface UseVersionControlReturn {
  versions: DocumentVersion[]
  currentVersion: DocumentVersion | null
  saveVersion: (label?: string) => void
  discardChanges: () => void
  restoreVersion: (versionId: string) => void
  hasUnsavedChanges: boolean
}
```

**IndexedDB Schema:**

```typescript
interface EditorDB {
  versions: {
    key: string // version id
    value: DocumentVersion
    indexes: {
      fragmentId: string
      createdAt: Date
    }
  }
  fragments: {
    key: string // fragment id
    value: {
      id: string
      currentVersionId: string
      state: 'draft' | 'in_review' | 'approved' | 'submitted'
    }
  }
}
```

---

### Phase 7: Section Progress Tracking (Day 13)

**Goal:** Track section completion status

**Tasks:**

1. Create section detection from document structure
2. Implement `SectionProgress.tsx` component
3. Add section state to version metadata
4. Display progress in UI

**Section Detection:**

```typescript
function extractSections(doc: ProseMirrorNode): Section[] {
  const sections: Section[] = []

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading' && node.attrs.level <= 2) {
      sections.push({
        id: node.attrs.id || generateId(),
        title: node.textContent,
        level: node.attrs.level,
        position: pos,
        status: 'pending', // Derived from user actions
      })
    }
  })

  return sections
}
```

---

### Phase 8: Event Bus & ScyAI Integration (Day 14-15)

**Goal:** Communication with parent Canvas

**Tasks:**

1. Implement event bus service
2. Define event contracts
3. Add fragment state management
4. Handle incoming commands from ScyAI
5. Emit events for version saves, AI edits, etc.

**Event Bus Interface:**

```typescript
interface EditorEventBus {
  // Outgoing events (Editor → Canvas/ScyAI)
  emit(event: 'version:saved', payload: { fragmentId: string; version: DocumentVersion }): void
  emit(event: 'ai:edit:complete', payload: { fragmentId: string; action: AIAction }): void
  emit(event: 'state:changed', payload: { fragmentId: string; state: FragmentState }): void

  // Incoming events (Canvas/ScyAI → Editor)
  on(event: 'fragment:load', handler: (payload: { fragmentId: string; content: JSONContent }) => void): void
  on(event: 'ai:command', handler: (payload: { instruction: string }) => void): void
  on(event: 'version:restore', handler: (payload: { versionId: string }) => void): void
}

// Implementation using custom events or postMessage
class EventBus implements EditorEventBus {
  emit(event: string, payload: any) {
    window.dispatchEvent(new CustomEvent(`scyai:editor:${event}`, { detail: payload }))
  }

  on(event: string, handler: (payload: any) => void) {
    window.addEventListener(`scyai:canvas:${event}`, (e: CustomEvent) => {
      handler(e.detail)
    })
  }
}
```

---

### Phase 9: Large Document Optimization (Day 16)

**Goal:** Ensure 300-page documents perform well

**Tasks:**

1. Profile with large synthetic documents
2. Implement debounced operations
3. Add virtual scrolling if needed
4. Optimize version snapshots
5. Memory management for version history

**Optimizations:**

```typescript
// Debounced version check
const checkUnsavedChanges = useMemo(
  () =>
    debounce((doc: ProseMirrorNode) => {
      const hasChanges = !isEqual(doc.toJSON(), lastSavedContent)
      setHasUnsavedChanges(hasChanges)
    }, 500),
  [lastSavedContent],
)

// Efficient section extraction (only on structure changes)
const sections = useMemo(() => {
  return extractSections(editor.state.doc)
}, [editor.state.doc.content.size]) // Only recalc on size change

// Memory-limited version cache
const VERSION_MEMORY_LIMIT = 10
function pruneVersionCache(versions: DocumentVersion[]) {
  if (versions.length > VERSION_MEMORY_LIMIT) {
    const toEvict = versions.slice(0, -VERSION_MEMORY_LIMIT)
    persistToIndexedDB(toEvict)
    return versions.slice(-VERSION_MEMORY_LIMIT)
  }
  return versions
}
```

---

### Phase 10: Testing & Polish (Day 17-18)

**Goal:** Production readiness

**Tasks:**

1. Write unit tests for hooks
2. Write Cypress E2E tests
3. Test with 300-page document
4. Accessibility audit
5. Error boundary implementation
6. Loading states and skeletons

**Test Cases:**

```typescript
// Unit tests
describe('useVersionControl', () => {
  it('saves version with correct metadata')
  it('persists to IndexedDB')
  it('restores from IndexedDB on refresh')
  it('handles concurrent edits')
})

describe('useAI', () => {
  it('streams content correctly')
  it('handles timeout gracefully')
  it('allows cancellation')
  it('rolls back on error')
})

// E2E tests
describe('AI Document Editor', () => {
  it('loads initial content from JSON')
  it('formats text with toolbar')
  it('shows AI bubble menu on selection')
  it('streams AI response into document')
  it('saves and restores versions')
  it('handles 300-page document')
})
```

---

## Key Technical Decisions

### 1. State Management

- **Zustand** for global editor state (simpler than Redux, tree-shakeable)
- **React hooks** for component-local state
- **Tiptap's useEditorState** for reactive editor state

### 2. Persistence

- **IndexedDB** via `idb` library for version storage
- **beforeunload** handler for unsaved changes
- Automatic background saves (debounced)

### 3. AI Integration

- **Server-Sent Events (SSE)** for streaming
- **AbortController** for cancellation
- **Position mapping** to handle concurrent edits

### 4. Chat UI

- **@assistant-ui/react** as base
- Custom styling to match Tiptap demo aesthetic
- Document context injection

### 5. Version Control

- **Linear versioning for MVP** (simpler than full DAG)
- In-memory active versions + IndexedDB for history
- Semantic versioning: 0 → 0.1 → 0.2 → 1.0

---

## API Contracts

### Fragment Props (from ScyAI)

```typescript
interface EditorFragmentProps {
  fragmentId: string
  documentType: 'pdbi_submission' | 'loss_summary' | 'engineering_report'
  initialContent: JSONContent // ProseMirror JSON
  blueprintId?: string
  state: 'draft' | 'in_review' | 'approved' | 'submitted'
  sectionState?: Record<string, 'pending' | 'complete' | 'in_review'>
  onStateChange?: (state: FragmentState) => void
  eventBus?: EditorEventBus
}
```

### AI Provider Interface

```typescript
interface AIProvider {
  streamEdit(params: { action: AIAction; text: string; context?: string; signal?: AbortSignal }): AsyncIterable<string>

  streamChat(params: {
    messages: ChatMessage[]
    documentContext?: DocumentContext
    signal?: AbortSignal
  }): AsyncIterable<string>
}
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@assistant-ui/react": "^0.5.x",
    "zustand": "^4.5.x",
    "idb": "^8.0.x",
    "lodash-es": "^4.17.x",
    "nanoid": "^5.0.x"
  }
}
```

---

## Risk Mitigations (from failure analysis)

| Risk                      | Mitigation                                      |
| ------------------------- | ----------------------------------------------- |
| Streaming position drift  | Use ProseMirror Mapping + position anchoring    |
| 300-page performance      | Debouncing, virtual scroll if needed, profiling |
| Version loss on refresh   | IndexedDB + beforeunload sync                   |
| Concurrent edit conflicts | Queue or rebase pattern                         |
| Context window overflow   | Smart context selection, never full document    |
| Selection invalidation    | Node ID anchoring, graceful fallback            |
| Backend timeout           | Explicit timeout handling, rollback, retry      |
| Section tracking desync   | Derive from document, don't store separately    |
| Memory accumulation       | Version cache limits, IndexedDB eviction        |

---

## Timeline Summary

| Phase               | Days  | Deliverable                   |
| ------------------- | ----- | ----------------------------- |
| 1. Foundation       | 1-2   | Basic editor with toolbar     |
| 2. Chat Panel       | 3-4   | Working chat UI               |
| 3. AI Bubble Menu   | 5-6   | Selection-based AI actions    |
| 4. Mock Backend     | 6-7   | FastAPI with streaming        |
| 5. Chat-Document    | 8-9   | Reference & apply from chat   |
| 6. Version Control  | 10-12 | Save/restore with persistence |
| 7. Section Progress | 13    | Progress tracking UI          |
| 8. Event Bus        | 14-15 | ScyAI integration             |
| 9. Optimization     | 16    | Large document handling       |
| 10. Testing         | 17-18 | Tests and polish              |

**Total: ~18 days for full implementation**

---

## Open Questions for User

1. **Blueprint validation**: Should the editor validate document structure against a blueprint schema? If so, what's the schema format?

2. **Collaborative editing**: Is multi-user collaboration needed for MVP, or post-MVP? (Would require Yjs/Hocuspocus integration)

3. **Export formats**: Should the editor support export to DOCX/PDF, or is JSON sufficient for MVP?

4. **Offline support**: How important is offline editing capability?
