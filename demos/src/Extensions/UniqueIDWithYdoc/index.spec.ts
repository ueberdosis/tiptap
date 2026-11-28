import { expect, test } from '@playwright/test'

test('transformed collaborative content keeps unique IDs after editing', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/src/Extensions/UniqueIDWithYdoc/React/')

  const editor = page.locator('.tiptap')
  await expect(editor.locator('h1')).toHaveText('This is a predefined, collaborative ydoc')
  await expect(editor.locator('p')).toHaveCount(2)
  await editor.click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.press('Enter')
  await page.keyboard.insertText('A new collaborative paragraph')
  await expect(editor.locator('p')).toHaveCount(3)

  const ids = await editor.locator('h1, p').evaluateAll(elements => {
    return elements.map(element => element.getAttribute('data-id'))
  })

  expect(ids.every(Boolean)).toBe(true)
  expect(new Set(ids).size).toBe(ids.length)
  expect(errors).toEqual([])
})
