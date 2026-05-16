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

test.describe('/src/Extensions/Typography/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/Typography/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('should make an em dash from two dashes', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '-- emDash')
    await expect(page.locator('.tiptap').filter({ hasText: '— emDash' }).first()).toBeAttached()
  })

  test('should make an ellipsis from three dots', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '... ellipsis')
    await expect(page.locator('.tiptap').filter({ hasText: '… ellipsis' }).first()).toBeAttached()
  })

  test('should make a correct open double quote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '"openDoubleQuote"')
    await expect(page.locator('.tiptap').filter({ hasText: '“openDoubleQuote' }).first()).toBeAttached()
  })

  test('should make a correct close double quote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '"closeDoubleQuote"')
    await expect(page.locator('.tiptap').filter({ hasText: 'closeDoubleQuote”' }).first()).toBeAttached()
  })

  test('should make a correct open single quote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, "'openSingleQuote'")
    await expect(page.locator('.tiptap').filter({ hasText: '‘openSingleQuote’' }).first()).toBeAttached()
  })

  test('should make a correct close single quote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, "'closeSingleQuote'")
    await expect(page.locator('.tiptap').filter({ hasText: 'closeSingleQuote’' }).first()).toBeAttached()
  })

  test('should make a left arrow', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '<- leftArrow')
    await expect(page.locator('.tiptap').filter({ hasText: '← leftArrow' }).first()).toBeAttached()
  })

  test('should make a right arrow', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '-> rightArrow')
    await expect(page.locator('.tiptap').filter({ hasText: '→ rightArrow' }).first()).toBeAttached()
  })

  test('should make a copyright sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '(c) copyright')
    await expect(page.locator('.tiptap').filter({ hasText: '© copyright' }).first()).toBeAttached()
  })

  test('should make a registered trademark sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '(r) registeredTrademark')
    await expect(page.locator('.tiptap').filter({ hasText: '® registeredTrademark' }).first()).toBeAttached()
  })

  test('should make a trademark sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '(tm) trademark')
    await expect(page.locator('.tiptap').filter({ hasText: '™ trademark' }).first()).toBeAttached()
  })

  test('should make a one half', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1/2 oneHalf')
    await expect(page.locator('.tiptap').filter({ hasText: '½ oneHalf' }).first()).toBeAttached()
  })

  test('should make a plus/minus sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '+/- plusMinus')
    await expect(page.locator('.tiptap').filter({ hasText: '± plusMinus' }).first()).toBeAttached()
  })

  test('should make a not equal sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '!= notEqual')
    await expect(page.locator('.tiptap').filter({ hasText: '≠ notEqual' }).first()).toBeAttached()
  })

  test('should make a laquo', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '<< laquorow')
    await expect(page.locator('.tiptap').filter({ hasText: '« laquo' }).first()).toBeAttached()
  })

  test('should make a raquo', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '>> raquorow')
    await expect(page.locator('.tiptap').filter({ hasText: '» raquo' }).first()).toBeAttached()
  })

  test('should make a multiplication sign from an asterisk', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1*1 multiplication')
    await expect(page.locator('.tiptap').filter({ hasText: '1×1 multiplication' }).first()).toBeAttached()
  })

  test('should make a multiplication sign from an x', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1x1 multiplication')
    await expect(page.locator('.tiptap').filter({ hasText: '1×1 multiplication' }).first()).toBeAttached()
  })

  test('should make a multiplication sign from an asterisk with spaces', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1 * 1 multiplication')
    await expect(page.locator('.tiptap').filter({ hasText: '1 × 1 multiplication' }).first()).toBeAttached()
  })

  test('should make a multiplication sign from an x with spaces', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1 x 1 multiplication')
    await expect(page.locator('.tiptap').filter({ hasText: '1 × 1 multiplication' }).first()).toBeAttached()
  })
})
