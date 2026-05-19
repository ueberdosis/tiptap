import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'ExportHTML'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/GuideContent'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p>Example Text</p>')
      })

      test('returns html', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<p>Example Text</p>')
      })
    })
  })
})
