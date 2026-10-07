import { expect, test } from '@playwright/test'
import type { Editor } from '@tiptap/core'

test('preserves HTML comments in headings after an update', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))

  await page.goto('/src/Markdown/Parse/React/')
  await page.getByRole('button', { name: 'Parse Markdown', exact: true }).click()

  const heading = page.locator('.tiptap h2').filter({ hasText: 'Week of' })
  await expect(heading).toHaveText('Week of <!-- date -->')

  await page.locator('.tiptap').evaluate(element => {
    const { editor } = element as HTMLElement & { editor: Editor }
    const transaction = editor.state.tr

    editor.state.doc.descendants((node, position) => {
      if (node.type.name === 'heading') {
        transaction.setNodeMarkup(position, undefined, node.attrs)
      }
    })

    editor.view.dispatch(transaction)
    editor.state.doc.check()
  })

  await expect(heading).toHaveText('Week of <!-- date -->')
  expect(errors).toEqual([])
})
