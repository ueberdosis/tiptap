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

test.describe('/src/Examples/CodeBlockLanguage/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/CodeBlockLanguage/Vue/')
  })

  test('should have hljs classes for syntax highlighting', async ({ page }) => {
    {
      const elements = await page
        .locator('[class^=hljs]')
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

      expect(elements.length).toBeGreaterThan(0)
    }
  })

  test('should have different count of hljs classes after switching language', async ({ page }) => {
    {
      const elements = await page
        .locator('[class^=hljs]')
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

      const initialCount = elements.length

      expect(initialCount).toBeGreaterThan(0)

      await page.waitForTimeout(100)
      await page.locator('.tiptap select').first().selectOption('java')
      await page.waitForTimeout(500)

      {
        const newElements = await page
          .locator('[class^=hljs]')
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

        const newCount = newElements.length

        expect(newCount).not.toBe(initialCount)
      }
    }
  })
})
