## Changes Overview

Fix drag ghost (`setDragImage`) for RTL editors and mixed-direction blocks: the temporary wrapper now mirrors the **dragged block's** text direction, and the drag hotspot is aligned to the **pointer** using the wrapper's bounds (not a fixed corner).

## Implementation Approach

1. **Direction on the ghost wrapper**
   Direction detection is extracted into a standalone helper (`getDraggedBlockDir`). It resolves the dragged block's DOM element via `view.nodeDOM(pos)` first — which maps a ProseMirror position directly to the block-level DOM element — avoiding the parent-container ambiguity of `domAtPos` at block boundaries. Falls back to `view.domAtPos` with proper child-at-offset resolution, and ultimately to `view.dom`'s direction (default `'ltr'`). The wrapper's `dir` attribute is set accordingly so the ghost clone matches the dragged block's direction.

2. **Drag image hotspot**
   `DataTransfer.setDragImage` uses the off-screen `wrapper` as the image. After cloning and `append`, measure `wrapper.getBoundingClientRect()` and set the hotspot x to `clientX - wrapperRect.left`, clamped to `[0, wrapperRect.width]`, so the ghost tracks the cursor in both LTR and RTL.

## Testing Done

- **Automated**: 8 unit tests in `getDraggedBlockDir.spec.ts` covering `nodeDOM` direct hit (RTL/LTR), `domAtPos` fallback with child-at-offset resolution, mixed RTL/LTR regression (parent wrapper vs. dragged block direction), and ultimate fallback to editor root / default `'ltr'`.
- **Manual**: drag handle in an RTL-configured editor; mixed Arabic/Latin paragraphs where block `direction` differs from `view.dom`. Confirmed ghost text direction and pointer alignment during drag.

## Verification Steps

1. Set editor / root to `dir="rtl"` (or CSS `direction: rtl`).
2. Drag a block via the drag handle; confirm the ghost renders with correct direction and stays under/near the cursor.
3. Optional: `dir="auto"` or LTR block inside RTL editor — ghost should follow the **block** direction.
4. Run `vitest run packages/extension-drag-handle/__tests__/getDraggedBlockDir.spec.ts` to verify all 8 direction-detection tests pass.

## Additional Notes

- Supersedes an earlier approach that only toggled `dir` on the editor root and used `offsetWidth` as the hotspot, which mis-handled mixed-direction content and mis-aligned the ghost.
- The previous `domAtPos(...).node` approach was replaced because ProseMirror can return the parent container (editor root / list wrapper) plus an offset at block boundaries, reading the wrong direction in mixed RTL/LTR cases.
