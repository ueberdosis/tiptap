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

test.describe('/src/Examples/AutolinkValidation/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/AutolinkValidation/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
  })

  const validLinks = [
    // [rawTextInput, textThatShouldBeLinked]
    ['https://tiptap.dev ', 'https://tiptap.dev'],
    ['http://tiptap.dev ', 'http://tiptap.dev'],
    ['https://www.tiptap.dev/ ', 'https://www.tiptap.dev/'],
    ['http://www.tiptap.dev/ ', 'http://www.tiptap.dev/'],
    ['[http://www.example.com/] ', 'http://www.example.com/'],
    ['(http://www.example.com/) ', 'http://www.example.com/'],
  ]

  const invalidLinks = [
    'tiptap.dev',
    'www.tiptap.dev',
    // If you don't type a space, don't autolink
    'https://tiptap.dev',
  ]

  validLinks.forEach(([rawTextInput, textThatShouldBeLinked]) => {
    test(`should autolink ${rawTextInput}`, async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, rawTextInput)
      page.locator('.tiptap a').filter({ hasText: textThatShouldBeLinked })
    })
  })

  for (const rawTextInput of invalidLinks) {
    test(`should not autolink ${rawTextInput}`, async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, `{selectall}{backspace}${rawTextInput}`)
      await expect(page.locator('.tiptap a')).toHaveCount(0)
    })
  }
})
