import { expect, test } from '@playwright/test'
import type { Editor } from '@tiptap/core'

test.use({
  userAgent:
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/145.0.0.0 Mobile Safari/537.36',
  hasTouch: true,
})

for (const suffix of ['mirror', 'e']) {
  test(`preserves mark toggles when composing the suffix ${suffix}`, async ({ page }) => {
    await page.goto('/src/Bugs/AndroidStoredMarks/React/')
    const editor = page.locator('.tiptap')
    const client = await page.context().newCDPSession(page)
    const compose = (text: string) =>
      client.send('Input.imeSetComposition', {
        text,
        selectionStart: text.length,
        selectionEnd: text.length,
      })
    const toggleBold = () =>
      editor.evaluate(element => {
        ;(element as HTMLElement & { editor: Editor }).editor.commands.toggleBold()
      })

    await editor.click()
    await compose('Prose')
    await toggleBold()
    await compose('mirror')
    await toggleBold()
    await client.send('Input.insertText', { text: ' ' })
    await compose('prose')
    await toggleBold()
    await compose(`prose${suffix}`)
    await expect
      .poll(() =>
        editor.evaluate(element => (element as HTMLElement & { editor: Editor }).editor.getHTML()),
      )
      .toBe(`<p>Prose<strong>mirror</strong> prose<strong>${suffix}</strong></p>`)
    await toggleBold()
    await compose('s')
    await expect
      .poll(() =>
        editor.evaluate(element => (element as HTMLElement & { editor: Editor }).editor.getHTML()),
      )
      .toBe(`<p>Prose<strong>mirror</strong> prose<strong>${suffix}</strong>s</p>`)
    await client.send('Input.insertText', { text: 's ' })

    await expect(editor).toHaveText(`Prosemirror prose${suffix}s `)
    await expect(editor.locator('strong')).toHaveText(['mirror', suffix])
  })
}
