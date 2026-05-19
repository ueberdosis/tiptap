import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Image'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Nodes'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
          ;(window as any).prompt = () => 'foobar.png'
        })
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p>Example Text</p>')
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
      })

      test('button adds an img tag with correct URL', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap img')).toHaveAttribute('src', 'foobar.png')
      })
    })
  })
})
