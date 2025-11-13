import { expect, test } from '@playwright/test'

test.describe('TextDirection', () => {
  test('should apply text direction attributes', async ({ page }) => {
    await page.goto('http://localhost:3000/Examples/TextDirection/React')

    await page.waitForSelector('.tiptap')

    const firstParagraph = page.locator('.tiptap p').first()
    const dirAttribute = await firstParagraph.getAttribute('dir')

    expect(dirAttribute).toBe('auto')
  })

  test('should change global direction', async ({ page }) => {
    await page.goto('http://localhost:3000/Examples/TextDirection/React')

    await page.waitForSelector('.tiptap')

    await page.click('button:has-text("RTL")')

    await page.waitForTimeout(100)

    const firstParagraph = page.locator('.tiptap p').first()
    const dirAttribute = await firstParagraph.getAttribute('dir')

    expect(dirAttribute).toBe('rtl')
  })

  test('should set direction on selection', async ({ page }) => {
    await page.goto('http://localhost:3000/Examples/TextDirection/React')

    await page.waitForSelector('.tiptap')

    const paragraph = page.locator('.tiptap p').first()
    await paragraph.click()

    await page.click('button:has-text("Set LTR")')

    await page.waitForTimeout(100)

    const dirAttribute = await paragraph.getAttribute('dir')

    expect(dirAttribute).toBe('ltr')
  })

  test('should unset direction', async ({ page }) => {
    await page.goto('http://localhost:3000/Examples/TextDirection/React')

    await page.waitForSelector('.tiptap')

    await page.click('button:has-text("None")')

    await page.waitForTimeout(100)

    const firstParagraph = page.locator('.tiptap p').first()
    const dirAttribute = await firstParagraph.getAttribute('dir')

    expect(dirAttribute).toBeNull()
  })
})
