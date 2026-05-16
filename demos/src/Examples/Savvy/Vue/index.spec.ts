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

test.describe('/src/Examples/Savvy/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Savvy/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  const tests = [
    ['(c)', '©'],
    ['->', '→'],
    ['>>', '»'],
    ['1/2', '½'],
    ['!=', '≠'],
    ['--', '—'],
    ['1x1', '1×1'],
    [':-) ', '🙂'],
    ['<3 ', '❤️'],
    ['>:P ', '😜'],
  ]

  for (const [input, output] of tests) {
    test(`should parse ${input} correctly`, async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, `${input} `)
      await expect(page.locator('.tiptap').filter({ hasText: output }).first()).toBeAttached()
    })
  }

  test('should parse hex colors correctly', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '#FD9170')
  })
})
