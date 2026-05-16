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

test.describe('/src/Examples/Drawing/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Drawing/Vue/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    // eslint-disable-next-line
    expect(editor).to.not.be.null
  })

  test('should have a svg canvas', async ({ page }) => {
    await expect(page.locator('.tiptap svg')).toHaveCount(1)
  })

  test('should draw on the svg canvas', async ({ page }) => {
    await expect(page.locator('.tiptap svg')).toHaveCount(1)

    await page.waitForTimeout(500)

    // TODO(playwright-migration): translate cy.get('input').then(arrow):
    // inputs => {
    //       const color = inputs[0].value
    //       const size = inputs[1].value
    //
    //       cy.get('.tiptap svg')
    //         .click()
    //         .trigger('mousedown', { pageX: 100, pageY: 100, which: 1 })
    //         .trigger('mousemove', { pageX: 200, pageY: 200, which: 1 })
    //         .trigger('mouseup')
    //
    //       cy.get('.tiptap svg path')
    //         .should('exist')
    //         .should('have.attr', 'stroke-width', size)
    //         .should('have.attr', 'stroke', color.toUpperCase())
    //     }
  })
})
