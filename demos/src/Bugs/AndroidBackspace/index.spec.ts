import { expect, test } from '@playwright/test'

test.use({
  userAgent:
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/145.0.0.0 Mobile Safari/537.36',
  hasTouch: true,
})

test('keeps the caret valid when native Backspace follows focus', async ({ page }) => {
  const errors: string[] = []
  await page.goto('/src/Bugs/AndroidBackspace/React/')
  const editor = page.locator('.tiptap')

  await editor.click()
  await page.keyboard.press('ControlOrMeta+End')
  page.on('pageerror', error => errors.push(error.message))
  await editor.evaluate(element => {
    const editable = element as HTMLElement

    editable.blur()
    editable.focus()
    editable.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'deleteContentBackward',
        bubbles: true,
        cancelable: true,
      }),
    )
    document.execCommand('delete')
  })

  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 60)))
  await expect(editor).toHaveText('First paragraphSecond paragrap')
  await page.keyboard.type('!')
  await expect(editor).toHaveText('First paragraphSecond paragrap!')
  expect(errors).toEqual([])
})
