import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Document'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Nodes'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p></p>')
      })

      test('returns the document as json', async ({ page }) => {
        const editor = await getEditor(page)
        const json = await editor.evaluate((el: any) => el.editor.getJSON())
        expect(json).toEqual({
          type: 'doc',
          content: [{ type: 'paragraph' }],
        })
      })
    })
  })
})
