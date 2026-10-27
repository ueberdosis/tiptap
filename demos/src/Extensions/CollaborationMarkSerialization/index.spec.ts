import { expect, test } from '@playwright/test'

test('serializes empty and populated mark attributes', async ({ page }) => {
  await page.goto('/src/Extensions/CollaborationMarkSerialization/React/')
  const output = page.locator('.output-group pre')
  await expect(output).toContainText('"bold"')
  const content = JSON.parse(await output.innerText())
  expect(content.content[0].content[0].marks).toEqual([{ type: 'bold' }])
  expect(content.content[0].content[1].marks).toEqual([
    { type: 'comment', attrs: { id: 'example' } },
  ])
})
