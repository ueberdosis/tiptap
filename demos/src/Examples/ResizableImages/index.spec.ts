import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'ResizableImages'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
          window.prompt = () => 'foobar.png'
        })
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().setContent('<p>Example Text</p>').selectAll().run()
        })
      })

      test('should add an img tag with the correct URL', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap img')).toHaveAttribute('src', 'foobar.png')
      })
    })
  })
})
