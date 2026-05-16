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
    await expect(page.locator('.tiptap')).toContainText('— emDash')
  })

  test('should make an ellipsis from three dots', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '... ellipsis')
    await expect(page.locator('.tiptap')).toContainText('… ellipsis')
  })

  test('should make a correct open double quote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '"openDoubleQuote"')
    await expect(page.locator('.tiptap')).toContainText('“openDoubleQuote')
  })

  test('should make a correct close double quote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '"closeDoubleQuote"')
    await expect(page.locator('.tiptap')).toContainText('closeDoubleQuote”')
  })

  test('should make a correct open single quote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, "'openSingleQuote'")
    await expect(page.locator('.tiptap')).toContainText('‘openSingleQuote’')
  })

  test('should make a correct close single quote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, "'closeSingleQuote'")
    await expect(page.locator('.tiptap')).toContainText('closeSingleQuote’')
  })

  test('should make a left arrow', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '<- leftArrow')
    await expect(page.locator('.tiptap')).toContainText('← leftArrow')
  })

  test('should make a right arrow', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '-> rightArrow')
    await expect(page.locator('.tiptap')).toContainText('→ rightArrow')
  })

  test('should make a copyright sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '(c) copyright')
    await expect(page.locator('.tiptap')).toContainText('© copyright')
  })

  test('should make a registered trademark sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '(r) registeredTrademark')
    await expect(page.locator('.tiptap')).toContainText('® registeredTrademark')
  })

  test('should make a trademark sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '(tm) trademark')
    await expect(page.locator('.tiptap')).toContainText('™ trademark')
  })

  test('should make a one half', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1/2 oneHalf')
    await expect(page.locator('.tiptap')).toContainText('½ oneHalf')
  })

  test('should make a plus/minus sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '+/- plusMinus')
    await expect(page.locator('.tiptap')).toContainText('± plusMinus')
  })

  test('should make a not equal sign', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '!= notEqual')
    await expect(page.locator('.tiptap')).toContainText('≠ notEqual')
  })

  test('should make a laquo', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '<< laquorow')
    await expect(page.locator('.tiptap')).toContainText('« laquo')
  })

  test('should make a raquo', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '>> raquorow')
    await expect(page.locator('.tiptap')).toContainText('» raquo')
  })

  test('should make a multiplication sign from an asterisk', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1*1 multiplication')
    await expect(page.locator('.tiptap')).toContainText('1×1 multiplication')
  })

  test('should make a multiplication sign from an x', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1x1 multiplication')
    await expect(page.locator('.tiptap')).toContainText('1×1 multiplication')
  })

  test('should make a multiplication sign from an asterisk with spaces', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1 * 1 multiplication')
    await expect(page.locator('.tiptap')).toContainText('1 × 1 multiplication')
  })

  test('should make a multiplication sign from an x with spaces', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1 x 1 multiplication')
    await expect(page.locator('.tiptap')).toContainText('1 × 1 multiplication')
  })
})
