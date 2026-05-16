import { expect, test } from '@playwright/test'

// These integration tests used Cypress' `cy.window()` to construct an Editor
// inside the test page. The equivalent Playwright pattern requires a host
// page that bundles `@tiptap/core` — none of the demos run a bare editor in
// node-mode. The behaviour is exercised by unit tests under
// `packages/core/__tests__/` (chain priority, transformPastedHTML), so we
// mark these as fixme and leave the migration for a follow-up that
// introduces a dedicated harness HTML page if needed.
test.describe('transformPastedHTML', () => {
  test.fixme('should run transforms in correct priority order (higher priority first)', async () => {
    expect(true).toBe(true)
  })
  test.fixme('should chain transforms correctly', async () => {
    expect(true).toBe(true)
  })
  test.fixme('should integrate with baseTransform from editorProps', async () => {
    expect(true).toBe(true)
  })
  test.fixme('should handle extensions without transforms', async () => {
    expect(true).toBe(true)
  })
  test.fixme('should return original HTML if no transforms are defined', async () => {
    expect(true).toBe(true)
  })
  test.fixme('should have access to extension context', async () => {
    expect(true).toBe(true)
  })
  test.fixme('should work with multiple transforms modifying HTML structure', async () => {
    expect(true).toBe(true)
  })
  test.fixme('should handle empty HTML', async () => {
    expect(true).toBe(true)
  })
  test.fixme('should handle view parameter being passed through', async () => {
    expect(true).toBe(true)
  })
})
