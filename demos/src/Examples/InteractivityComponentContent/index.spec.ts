import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'InteractivityComponentContent'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`
    const componentClass = frameworkPath === 'React' ? '.react-component' : '.vue-component'
    const nodeName = frameworkPath === 'React' ? 'reactComponent' : 'vueComponent'

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('should render a custom node', async ({ page }) => {
        await getEditor(page)
        await expect(page.locator(`.ProseMirror ${componentClass}`)).toHaveCount(1)
      })

      test('should allow text editing inside component', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any, name: string) => {
          const e = el.editor
          e.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name !== name) {
              return true
            }
            const from = pos + 1
            const to = pos + node.nodeSize - 1
            e.chain()
              .focus()
              .setTextSelection({ from, to })
              .deleteSelection()
              .insertContent('Hello World!')
              .run()
            return false
          })
        }, nodeName)

        const content = page.locator(`.ProseMirror ${componentClass} .content`).first()
        await expect(content).toHaveText('Hello World!')
      })

      test('should allow text editing inside component with markdown text', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any, name: string) => {
          const e = el.editor
          e.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name !== name) {
              return true
            }
            const from = pos + 1
            const to = pos + node.nodeSize - 1
            e.chain().focus().setTextSelection({ from, to }).deleteSelection().run()
            return false
          })
        }, nodeName)

        const content = page.locator(`.ProseMirror ${componentClass} .content`).first()

        await content.click()
        await page.keyboard.type('Hello World! This is **bold**.')

        await expect(content).toHaveText('Hello World! This is bold.')
        await expect(page.locator(`.ProseMirror ${componentClass} .content strong`)).toBeVisible()
      })

      test('should remove node via selectall', async ({ page }) => {
        const editor = await getEditor(page)

        await expect(page.locator(`.ProseMirror ${componentClass}`)).toHaveCount(1)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().selectAll().deleteSelection().run()
        })

        await expect(page.locator(`.ProseMirror ${componentClass}`)).toHaveCount(0)
      })
    })
  })
})
