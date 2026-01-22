# DibDab - Rich Text Editor for Node-Based Canvases

## Product Vision
DibDab is a rich text editor built for spatial computing interfaces - node-based canvases, infinite whiteboards, and visual programming environments. While others bolt editors into these contexts, DibDab is architecturally designed for them.

**Target customers:** Teams building tools like Figma, Miro, Notion, Observable, node-based IDEs, visual workflow builders.

**Positioning:** "The editor that knows it lives on a canvas."

---

## Phase 1: Fork & Understand

### 1.1 Repository Setup
- [ ] Fork Tiptap from https://github.com/ueberdosis/tiptap ✅ (DONE - forked to dibdab)
- [ ] Rename to DibDab throughout codebase (IN PROGRESS)
- [ ] Set up monorepo structure (pnpm workspace or turborepo) ✅ (DONE - already using pnpm workspace + turbo)
- [ ] Establish branching strategy (track upstream for security patches only)
- [ ] Set up private GitHub repo (commercial project)
- [ ] Configure build pipeline
- [ ] **SPRING CLEAN:** Remove unnecessary extensions, demos, and deprecated packages

### 1.2 Codebase Archaeology
Before changing anything, understand the terrain:
- [ ] Map Tiptap's architecture (core → extensions → adapters)
- [ ] Document ProseMirror integration points
- [ ] Identify all event handling touchpoints
- [ ] Trace pointer event flow from DOM → ProseMirror → Tiptap
- [ ] List all keyboard shortcut registrations
- [ ] Understand the plugin system architecture
- [ ] Document the view layer abstraction

### 1.3 Dependency Audit
- [ ] List all Tiptap packages and their purposes
- [ ] Identify which packages to keep/modify/remove
- [ ] Check all license compatibility for commercial use
- [ ] ProseMirror packages - understand which are essential

**Likely package structure after fork:**
```
packages/
  @dibdab/core           # Forked from @dibdab/core
  @dibdab/pm             # ProseMirror re-exports (keep as-is)
  @dibdab/react          # Forked from @dibdab/react
  @dibdab/canvas-aware   # NEW - core canvas integration
  @dibdab/starter-kit    # Forked, includes canvas-aware by default
  @dibdab/extension-*    # Forked extensions as needed
```

---

## Phase 2: Core Architecture Changes

### 2.1 Canvas Context System
Build canvas awareness into the editor core, not as an afterthought.

- [ ] Create `CanvasContext` interface:
  - [ ] Define zoom level tracking
  - [ ] Define viewport coordinates
  - [ ] Define parent node/container information
  - [ ] Define canvas interaction modes

[DOCUMENT INCOMPLETE - TO BE CONTINUED]

---

## Git & Development Workflow

### Branch Strategy
- **main**: Production-ready code only
- **develop**: Integration branch for features
- **claude/[feature]-[sessionid]**: Feature branches (can be rewound)
- **upstream**: Track original Tiptap repo (for security patches only)

### Development Guidelines
- Commit frequently with clear, descriptive messages
- Keep feature branches focused and mergeable
- Use staged development that can be rewound if needed
- Regular spring cleaning to remove cruft

### Housekeeping Checklist
- [ ] Set up upstream remote for Tiptap security patches
- [ ] Define clear commit message conventions
- [ ] Set up branch protection rules
- [ ] Document rollback procedures

---

## Notes & Decisions

### Spring Clean TODO
Items to remove/evaluate from the Tiptap fork:
- Deprecated packages (already in `packages-deprecated/`)
- Unnecessary demos
- Extensions we won't need for canvas use cases
- Tiptap-specific branding and documentation
- Collaboration extensions (if not needed initially)
- Framework adapters we don't support (Vue 2?)

### Open Questions
- [ ] Which frameworks to support initially? (React only, or React + Vue 3?)
- [ ] Which extensions are essential for canvas editing?
- [ ] Licensing strategy for commercial use
- [ ] Upstream security patch strategy

---

*This is a living document. Update as the project evolves.*
