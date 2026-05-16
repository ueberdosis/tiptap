import {
  editorEval,
  expect,
  getEditorHTML,
  getEditorJSON,
  getEditorText,
  pasteIntoEditor,
  pressShortcut,
  setEditorContent,
  test,
  typeInEditor,
  typeText,
  waitForEditor,
  withEditor,
} from '../../../../../tests/e2e/support/index.js'

test.describe('/src/Extensions/Mathematics/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/Mathematics/React/')
  })

  test('should include katex-rendered inline and block nodes', async ({ page }) => {
    // TODO(playwright-migration): translate // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // arrow:
    // () => {
    //       cy.get('.tiptap span[data-type="inline-math"]').should('have.length', 21)
    //       cy.get('.tiptap div[data-type="block-math"]').should('have.length', 1)
    //
    //       cy.get('.tiptap span[data-type="inline-math"] .katex').should('have.length', 21)
    //       cy.get('.tiptap div[data-type="block-math"] .katex').should('have.length', 1)
    //     }
  })
})
