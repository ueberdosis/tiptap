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

test.describe('/src/Examples/CodeBlockLanguage/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/CodeBlockLanguage/React/')
  })

  test('should have hljs classes for syntax highlighting', async ({ page }) => {
    // TODO(playwright-migration): translate // TODO(playwright-migration): translate cy.get('[class^=hljs]').then(arrow):
    // arrow:
    // elements => {
    //       expect(elements.length).toBeGreaterThan(0)
    //     }
  })

  test('should have different count of hljs classes after switching language', async ({ page }) => {
    // TODO(playwright-migration): translate // TODO(playwright-migration): translate cy.get('[class^=hljs]').then(arrow):
    // arrow:
    // elements => {
    //       const initialCount = elements.length
    //
    //       expect(initialCount).toBeGreaterThan(0)
    //
    //       cy.wait(100)
    //       cy.get('.tiptap select').select('java')
    //       cy.wait(500)
    //
    //       // TODO(playwright-migration): translate cy.get('[class^=hljs]').then(arrow):
    // newElements => {
    // //         const newCount = newElements.length
    // //
    // //         expect(newCount).not.toBe(initialCount)
    // //       }
    //     }
  })
})
