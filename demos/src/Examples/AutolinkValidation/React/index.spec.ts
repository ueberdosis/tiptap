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

test.describe('/src/Examples/AutolinkValidation/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/AutolinkValidation/React/')
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

  test('should not relink unset links after entering second link', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'https://tiptap.dev {home}')
    await expect(page.locator('.tiptap').first()).toHaveText('https://tiptap.dev ')
    await page.locator('[data-testid=unsetLink]').first().click()
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(0)
    await page.locator('.tiptap').first().click()
    await typeText(page, '{end}http://www.example.com/ ')
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(1)
    await expect(page.locator('.tiptap').locator('a').first()).toHaveAttribute('href', 'http://www.example.com/')
  })

  test('should not relink unset links after hitting next paragraph', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'https://tiptap.dev {home}')
    await expect(page.locator('.tiptap').first()).toHaveText('https://tiptap.dev ')
    await page.locator('[data-testid=unsetLink]').first().click()
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(0)
    await page.locator('.tiptap').first().click()
    await typeText(page, '{end}typing other text should prevent the link from relinking when hitting enter{enter}')
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(0)
  })

  test('should not relink unset links after modifying', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'https://tiptap.dev {home}')
    await expect(page.locator('.tiptap').first()).toHaveText('https://tiptap.dev ')
    await page.locator('[data-testid=unsetLink]').first().click()
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(0)
    await page.locator('.tiptap').first().click()
    await typeText(page, '{home}')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{rightArrow}'.repeat('https://'.length))
    await page.locator('.tiptap').first().click()
    await typeText(page, 'blah')
    await expect(page.locator('.tiptap').first()).toHaveText('https://blahtiptap.dev ')
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(0)
  })

  test('should autolink after hitting enter (new paragraph)', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'https://tiptap.dev{enter}')
    await expect(page.locator('.tiptap').first()).toHaveText('https://tiptap.dev')
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(1)
    await expect(page.locator('.tiptap').locator('a').first()).toHaveAttribute('href', 'https://tiptap.dev')
  })

  test('should autolink after hitting shift-enter (hardbreak)', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'https://tiptap.dev{shift+enter}')
    await expect(page.locator('.tiptap').first()).toHaveText('https://tiptap.dev')
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(1)
    await expect(page.locator('.tiptap').locator('a').first()).toHaveAttribute('href', 'https://tiptap.dev')
  })
})
