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

test.describe('/src/Examples/Formatting/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Formatting/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
  })

  const marks = [{ label: 'Highlight', mark: 'mark' }]

  for (const m of marks) {
    test(`sets ${m.label}`, async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, 'Hello world.{selectall}')
      await page.locator('button').filter({ hasText: m.label }).first().click()
      await expect(page.locator('.tiptap mark')).toHaveCount(1)
    })
  }

  const alignments = [
    { label: 'Left', alignment: 'left' },
    { label: 'Center', alignment: 'center' },
    { label: 'Right', alignment: 'right' },
    { label: 'Justify', alignment: 'justify' },
  ]

  for (const a of alignments) {
    test(`sets ${a.label}`, async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, 'Hello world.{selectall}')
      await page.locator('button').filter({ hasText: a.label }).first().click()
      if (a.alignment !== 'left') {
        await expect(page.locator('.tiptap p')).toHaveCSS('text-align', a.alignment)
      }
    })
  }
})
