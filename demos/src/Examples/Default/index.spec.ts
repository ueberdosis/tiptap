import { expect, test } from '@playwright/test'

import { clickButton, getEditor } from '../../../test/helpers.js'

const demoName = 'Default'
const frameworkPaths = ['React', 'Vue', 'Svelte']
const demoPath = '/src/Examples'

const buttonMarks = [
  { label: 'Bold', tag: 'strong' },
  { label: 'Italic', tag: 'em' },
  { label: 'Strike', tag: 's' },
]

const buttonNodes = [
  { label: 'H1', tag: 'h1' },
  { label: 'H2', tag: 'h2' },
  { label: 'H3', tag: 'h3' },
  { label: 'H4', tag: 'h4' },
  { label: 'H5', tag: 'h5' },
  { label: 'H6', tag: 'h6' },
  { label: 'Bullet list', tag: 'ul' },
  { label: 'Ordered list', tag: 'ol' },
  { label: 'Code block', tag: 'pre code' },
  { label: 'Blockquote', tag: 'blockquote' },
]

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().setContent('<h1>Example Text</h1>').selectAll().run()
        })
      })

      test('should apply the paragraph style when the keyboard shortcut is pressed', async ({ page }) => {
        await expect(page.locator('.tiptap h1')).toBeVisible()

        const editor = await getEditor(page)
        await editor.click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await editor.press('Meta+Alt+0')

        await expect(page.locator('.tiptap p').first()).toContainText('Example Text')
      })

      buttonMarks.forEach(m => {
        test(`should apply ${m.label} when the button is pressed`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.evaluate((el: any) => {
            el.editor.chain().focus().setContent('<p>Hello world</p>').selectAll().run()
          })
          await clickButton(page, 'Paragraph')
          await editor.evaluate((el: any) => el.editor.commands.selectAll())
          await clickButton(page, m.label)

          await expect(page.locator(`.tiptap ${m.tag}`)).toHaveText('Hello world')
        })
      })

      test('should clear marks when the button is pressed', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().setContent('<p>Hello world</p>').selectAll().run()
        })
        await clickButton(page, 'Paragraph')
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await clickButton(page, 'Bold')

        await expect(page.locator('.tiptap strong')).toHaveText('Hello world')

        await clickButton(page, 'Clear marks')
        await expect(page.locator('.tiptap strong')).toHaveCount(0)
      })

      test('should clear nodes when the button is pressed', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor
            .chain()
            .focus()
            .setContent('<ul><li><p>Hello world</p></li><li><p>A second item</p></li><li><p>A third item</p></li></ul>')
            .selectAll()
            .run()
        })

        await clickButton(page, 'Clear nodes')

        await expect(page.locator('.tiptap ul')).toHaveCount(0)
        await expect(page.locator('.tiptap p').first()).toContainText('Hello world')
      })

      buttonNodes.forEach(n => {
        test(`should set the correct type when ${n.label} is pressed`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.evaluate((el: any) => {
            el.editor.chain().focus().setContent('<p>Hello world</p>').selectAll().run()
          })
          await clickButton(page, n.label)

          await expect(page.locator(`.tiptap ${n.tag}`)).toHaveText('Hello world')
        })
      })

      test('should add a hr when on the same line as a node', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('ArrowRight')
        await clickButton(page, 'Horizontal rule')

        await expect(page.locator('.tiptap hr')).toHaveCount(1)
      })

      test('should add a hr when on a new line', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('ArrowRight')
        await editor.press('Enter')
        await clickButton(page, 'Horizontal rule')

        await expect(page.locator('.tiptap hr')).toHaveCount(1)
      })

      test('should add a br', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('ArrowRight')
        await clickButton(page, 'Hard break')

        const brCount = await page.locator('.tiptap br').count()

        expect(brCount).toBeGreaterThan(0)
      })

      test('should undo', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('End')
        await editor.type('~')
        await expect(page.locator('.tiptap')).toContainText('~')

        await clickButton(page, 'Undo')
        await expect(page.locator('.tiptap')).not.toContainText('~')
      })

      test('should redo', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('End')
        await editor.type('~')
        await expect(page.locator('.tiptap')).toContainText('~')

        await clickButton(page, 'Undo')
        await expect(page.locator('.tiptap')).not.toContainText('~')

        await clickButton(page, 'Redo')
        await expect(page.locator('.tiptap')).toContainText('~')
      })
    })
  })
})
