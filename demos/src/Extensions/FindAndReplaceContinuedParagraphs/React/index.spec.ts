import { expect, test } from '@playwright/test'

import { getEditor } from '../../../../test/helpers.js'

test.describe('/src/Extensions/FindAndReplaceContinuedParagraphs/React', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/FindAndReplaceContinuedParagraphs/React/')
  })

  test('highlights a match across continued paragraphs', async ({ page }) => {
    const editor = await getEditor(page)

    await page.getByLabel('Search').fill('brown fox')

    await expect(page.getByTestId('result-count')).toHaveText('1 of 1')
    await expect(editor.locator('.find-and-replace-result')).toHaveText(['brown ', 'fox'])
  })

  test('finds no match across paragraphs that do not continue', async ({ page }) => {
    await getEditor(page)
    await page.getByLabel('Search').fill('sleepy cat')

    await expect(page.getByTestId('result-count')).toHaveText('No results')
  })

  test('joins both paragraphs when replacing a match', async ({ page }) => {
    const editor = await getEditor(page)

    await page.getByLabel('Search').fill('brown fox')
    await expect(page.getByTestId('result-count')).toHaveText('1 of 1')
    await page.getByLabel('Replace').fill('red fox')
    await page.getByRole('button', { name: 'Replace', exact: true }).click()

    await expect(editor.locator('p')).toHaveCount(3)
    await expect(editor.locator('p').first()).toHaveText(
      'The dashed paragraph continues this one. The quick red fox jumps over the lazy dog.',
    )
    await expect(page.getByTestId('result-count')).toHaveText('No results')
  })
})
