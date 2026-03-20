<!-- Copy the sections below into your GitHub PR description when opening/updating the MR. -->

## Changes Overview

Fix drag ghost (`setDragImage`) for RTL editors and mixed-direction blocks: the temporary wrapper now mirrors the **dragged block’s** text direction, and the drag hotspot is aligned to the **pointer** using the wrapper’s bounds (not a fixed corner).

## Implementation Approach

1. **Direction on the ghost wrapper**  
   Resolve the DOM node at the drag range start (`view.domAtPos`), normalize text nodes to their `parentElement`, then read `getComputedStyle(...).direction` (falling back to `view.dom`). Set `wrapper`’s `dir` so the clone matches the block (including RTL page + LTR paragraph cases).

2. **Drag image hotspot**  
   `DataTransfer.setDragImage` uses the off-screen `wrapper` as the image. After cloning and `append`, measure `wrapper.getBoundingClientRect()` and set the hotspot x to `clientX - wrapperRect.left`, clamped to `[0, wrapperRect.width]`, so the ghost tracks the cursor in both LTR and RTL.

## Testing Done

- Manual: drag handle in an RTL-configured editor; mixed Arabic/Latin paragraphs where block `direction` differs from `view.dom`.
- Confirmed ghost text direction and pointer alignment during drag.

## Verification Steps

1. Set editor / root to `dir="rtl"` (or CSS `direction: rtl`).
2. Drag a block via the drag handle; confirm the ghost renders with correct direction and stays under/near the cursor.
3. Optional: `dir="auto"` or LTR block inside RTL editor — ghost should follow the **block** direction.

## Additional Notes

- Supersedes an earlier approach that only toggled `dir` on the editor root and used `offsetWidth` as the hotspot, which mis-handled mixed-direction content and mis-aligned the ghost.
