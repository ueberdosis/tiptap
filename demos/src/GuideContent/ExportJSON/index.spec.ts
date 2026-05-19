import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'ExportJSON'
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

      test('returns json', async ({ page }) => {
        const editor = await getEditor(page)
        const json = await editor.evaluate((el: any) => el.editor.getJSON())
        expect(json).toEqual({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Example Text' }],
            },
          ],
        })
      })
    })
  })
})
