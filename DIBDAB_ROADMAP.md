# DibDab - Rich Text Editor for Node-Based Canvases

## Product Vision
DibDab is a rich text editor built for spatial computing interfaces - node-based canvases, infinite whiteboards, and visual programming environments. While others bolt editors into these contexts, DibDab is architecturally designed for them.

**Target customers:** Teams building tools like Figma, Miro, Notion, Observable, node-based IDEs, visual workflow builders.

**Positioning:** "The editor that knows it lives on a canvas."

---

## Phase 1: Fork & Understand ✅ COMPLETED

### 1.1 Repository Setup ✅
- [x] Fork Tiptap from https://github.com/ueberdosis/tiptap ✅ (DONE - forked to dibdab)
- [x] Rename to DibDab throughout codebase ✅ (DONE - 922 files updated)
- [x] Set up monorepo structure (pnpm workspace or turborepo) ✅ (DONE - using pnpm workspace + turbo)
- [x] Establish branching strategy (track upstream for security patches only) ✅
- [x] Configure build pipeline ✅
- [x] **SPRING CLEAN:** Remove unnecessary extensions, demos, and deprecated packages ✅ (23 packages removed, 37% reduction)

### 1.2 Codebase Archaeology ✅
- [x] Map Tiptap's architecture (core → extensions → adapters) ✅ (See ARCHITECTURE.md)
- [x] Document ProseMirror integration points ✅
- [x] Identify all event handling touchpoints ✅
- [x] Trace pointer event flow from DOM → ProseMirror → Tiptap ✅
- [x] List all keyboard shortcut registrations ✅
- [x] Understand the plugin system architecture ✅
- [x] Document the view layer abstraction ✅

### 1.3 Dependency Audit ✅
- [x] List all Tiptap packages and their purposes ✅ (See SPRING_CLEAN_PLAN.md)
- [x] Identify which packages to keep/modify/remove ✅
- [x] Check all license compatibility for commercial use ✅ (MIT license maintained)
- [x] ProseMirror packages - understand which are essential ✅

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

## Phase 2: Core Architecture Changes ✅ COMPLETED

### 2.1 Canvas Context System ✅
Build canvas awareness into the editor core, not as an afterthought.

- [x] Create `CanvasContext` interface ✅ (packages/core/src/types/canvas.ts):
  - [x] Define zoom level tracking ✅ (Viewport with zoom property)
  - [x] Define viewport coordinates ✅ (Viewport with offset and size)
  - [x] Define parent node/container information ✅ (CanvasNode interface)
  - [x] Define canvas interaction modes ✅ (CanvasMode enum: edit, pan, select, readonly)

### 2.2 Editor Integration ✅
- [x] Add canvasContext property to Editor class ✅
- [x] Implement setCanvasContext() method ✅
- [x] Implement updateCanvasViewport() method ✅
- [x] Implement updateCanvasZoom() method ✅
- [x] Implement updateCanvasNodePosition() method ✅
- [x] Implement updateCanvasMode() method ✅
- [x] Implement updateCanvasVisibility() method ✅

### 2.3 Canvas Event System ✅
- [x] canvasZoom event ✅
- [x] canvasViewportChange event ✅
- [x] canvasNodeMove event ✅
- [x] canvasModeChange event ✅
- [x] canvasVisibilityChange event ✅

### 2.4 Coordinate Transformation ✅
- [x] createCoordinateTransform() utility ✅
- [x] screenToCanvas / canvasToScreen conversions ✅
- [x] screenToEditor / editorToScreen conversions ✅
- [x] Geometry helpers (isRectInViewport, getVisibleRect, etc.) ✅
- [x] Point utilities (distance, lerp, clamp) ✅

### 2.5 Canvas Extensions ✅
- [x] CanvasAware extension ✅
- [x] createCanvasContext() helper ✅
- [x] Auto-disable on canvas mode feature ✅
- [x] Visibility handling ✅

### 2.6 Documentation ✅
- [x] CANVAS_USAGE.md with examples ✅
- [x] TypeScript types exported ✅
- [x] React integration example ✅

---

## Phase 3: Advanced Canvas Features ✅ COMPLETED

### 3.1 Canvas-Aware Interactions ✅
- [x] Multi-editor focus management ✅ (CanvasFocusManager)
- [x] Canvas-aware drag & drop between editors ✅ (CanvasDragDrop)
- [x] Selection across multiple editors ✅ (CanvasSelection)
- [x] Copy/paste between canvas nodes ✅ (CanvasSelection commands)

### 3.2 Performance Optimization ✅
- [x] Viewport culling (only render visible editors) ✅ (CanvasViewportCulling)
- [x] Lazy loading for off-screen nodes ✅ (CanvasViewportCulling with callbacks)
- [x] Efficient coordinate transformation caching ✅ (createCachedCoordinateTransform)
- [x] Debounced viewport updates ✅ (CanvasViewportCulling + useCanvasViewport)

### 3.3 Advanced Extensions ✅
- [x] CanvasPointerEvents - Canvas-aware pointer handling ✅
- [x] CanvasSelection - Multi-editor selection ✅
- [x] CanvasDragDrop - Canvas-aware drag & drop ✅
- [x] CanvasKeyboard - Canvas-aware keyboard shortcuts ✅

### 3.4 Developer Experience ✅
- [x] Comprehensive documentation (PHASE3_FEATURES.md) ✅
- [ ] Build example canvas application (TODO for Phase 4)
- [ ] Create Storybook demos (TODO for Phase 4)
- [ ] Write comprehensive tests (TODO for Phase 4)

### 3.5 Framework Integrations ✅
- [x] React hooks for canvas integration (useCanvasEditor) ✅
- [x] Canvas focus manager hook (useCanvasFocusManager) ✅
- [x] Canvas viewport hook (useCanvasViewport) ✅
- [ ] Example React app with canvas (TODO for Phase 4)

### 3.6 TypeScript DTS Fix
- [ ] Fix module augmentation issues in command files (DEFERRED)
- [ ] Re-enable DTS generation for full type safety (DEFERRED)
- [x] Ensure all canvas types are properly exported ✅

**Phase 3 Summary:**
- ✅ 5 new canvas extensions (CanvasPointerEvents, CanvasViewportCulling, CanvasDragDrop, CanvasSelection, CanvasKeyboard)
- ✅ CanvasFocusManager for multi-editor focus management
- ✅ Coordinate transformation caching for performance
- ✅ 3 React hooks (useCanvasEditor, useCanvasFocusManager, useCanvasViewport)
- ✅ Comprehensive documentation (PHASE3_FEATURES.md)
- 📦 Bundle size: 253KB ESM (+31KB from Phase 2)

---

## Phase 4: Examples & Testing (FUTURE)

### 4.1 Example Applications
- [ ] Build interactive canvas demo app
- [ ] Create Storybook demos for all extensions
- [ ] Document common patterns and use cases
- [ ] Performance benchmarking suite

### 4.2 Testing
- [ ] Unit tests for all canvas extensions
- [ ] Integration tests for multi-editor scenarios
- [ ] E2E tests for canvas interactions
- [ ] Performance tests for large canvases

### 4.3 TypeScript & DX
- [ ] Fix module augmentation issues
- [ ] Re-enable DTS generation
- [ ] Improve type inference
- [ ] Add JSDoc comments

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
