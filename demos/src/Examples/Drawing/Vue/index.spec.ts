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
    await expect(page.locator('.tiptap svg').first()).toBeAttached()
  })

  test('should draw on the svg canvas', async ({ page }) => {
    await expect(page.locator('.tiptap svg').first()).toBeAttached()

    await page.waitForTimeout(500)

    {
      const inputs = await page
        .locator('input')
        .evaluateAll(els =>
          els.map(el => ({
            innerText: (el as HTMLElement).innerText,
            textContent: el.textContent ?? '',
            outerHTML: el.outerHTML,
            className: (el as HTMLElement).className,
            tagName: el.tagName,
            value: (el as HTMLInputElement).value ?? null,
            src: (el as HTMLImageElement).src ?? null,
            href: (el as HTMLAnchorElement).href ?? null,
          })),
        )

      const color = inputs[0].value
      const size = inputs[1].value

      await page.locator('.tiptap svg').first().click()
      await page.locator('.tiptap svg').first().dispatchEvent('mousedown', { pageX: 100, pageY: 100, which: 1 })
      await page.locator('.tiptap svg').first().dispatchEvent('mousemove', { pageX: 200, pageY: 200, which: 1 })
      await page.locator('.tiptap svg').first().dispatchEvent('mouseup', {})

      await expect(page.locator('.tiptap svg path').first()).toBeAttached()
      await expect(page.locator('.tiptap svg path').first()).toHaveAttribute('stroke-width', size)
      await expect(page.locator('.tiptap svg path').first()).toHaveAttribute('stroke', color.toUpperCase())
    }
  })
})
