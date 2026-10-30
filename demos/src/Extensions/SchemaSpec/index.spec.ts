import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

test('uses external structure with local rendering and preserves HTML and JSON roundtrips', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/src/Extensions/SchemaSpec/React/')
  const editor = await getEditor(page)

  await expect(editor.locator('p')).toHaveAttribute('data-tone', 'newsletter')
  await editor.locator('p').click()
  await editor.press(process.platform === 'darwin' ? 'Meta+a' : 'Control+a')
  await page.getByRole('button', { name: 'Bold', exact: true }).click()
  await expect(editor.locator('strong')).toHaveText('Edit this newsletter.')
  const json = await page.getByTestId('json-output').textContent()

  await page.getByRole('button', { name: 'Reload HTML' }).click()
  await expect(editor.locator('p')).toHaveAttribute('data-tone', 'newsletter')
  await expect(editor.locator('strong')).toHaveText('Edit this newsletter.')
  await expect(page.getByTestId('json-output')).toHaveText(json ?? '')

  await page.getByRole('button', { name: 'Reload JSON' }).click()
  await expect(editor.locator('p')).toHaveAttribute('data-tone', 'newsletter')
  await expect(editor.locator('strong')).toHaveText('Edit this newsletter.')
  await expect(page.getByTestId('json-output')).toHaveText(json ?? '')
  expect(errors).toEqual([])
})

test('provides custom node structure externally while keeping local rendering and plugins', async ({
  page,
}) => {
  await page.goto('/src/Extensions/SchemaSpec/React/')
  const editor = await getEditor(page)
  const customNode = editor.locator('aside[data-type="custom-node"]')

  await expect(customNode).toHaveAttribute('highlighted', 'false')
  await expect(customNode).toHaveText('Custom node. Click to highlight.')
  await customNode.click()
  await expect(customNode).toHaveAttribute('highlighted', 'true')
  await expect(customNode).toHaveText('Highlighted custom node. Click to reset.')
  await expect(page.getByTestId('json-output')).toContainText('"type": "customNode"')
  await expect(page.getByTestId('json-output')).toContainText('"highlighted": true')
  const json = await page.getByTestId('json-output').textContent()

  await page.getByRole('button', { name: 'Reload HTML' }).click()
  await expect(customNode).toHaveAttribute('highlighted', 'true')
  await expect(page.getByTestId('json-output')).toHaveText(json ?? '')
  await page.getByRole('button', { name: 'Reload JSON' }).click()
  await expect(customNode).toHaveAttribute('highlighted', 'true')
  await expect(page.getByTestId('json-output')).toHaveText(json ?? '')

  await customNode.click()
  await expect(customNode).toHaveAttribute('highlighted', 'false')
})
