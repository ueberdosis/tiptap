import { expect, test } from '@playwright/test'

const demoName = 'TypographyRTL'
const frameworkPaths = ['React']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await page.locator('.editor-auto .tiptap').first().waitFor()
      })

      test.describe('Automatic RTL detection', () => {
        test.beforeEach(async ({ page }) => {
          await page
            .locator('.editor-auto .tiptap')
            .first()
            .evaluate((el: any) => {
              el.editor.commands.clearContent()
            })
        })

        test('should use RTL double quotes when textDirection is rtl', async ({ page }) => {
          const editor = page.locator('.editor-auto .tiptap').first()

          await editor.click()
          await editor.type('"hello"')

          await expect(editor).toContainText('”hello“')
        })

        test('should use RTL single quotes when textDirection is rtl', async ({ page }) => {
          const editor = page.locator('.editor-auto .tiptap').first()

          await editor.click()
          await editor.type("'world'")

          await expect(editor).toContainText('’world‘')
        })
      })

      test.describe('Explicit RTL configuration', () => {
        test.beforeEach(async ({ page }) => {
          await page
            .locator('.editor-explicit .tiptap')
            .first()
            .evaluate((el: any) => {
              el.editor.commands.clearContent()
            })
        })

        test('should use RTL double quotes when configured', async ({ page }) => {
          const editor = page.locator('.editor-explicit .tiptap').first()

          await editor.click()
          await editor.type('"hello"')

          await expect(editor).toContainText('”hello“')
        })

        test('should use RTL single quotes when configured', async ({ page }) => {
          const editor = page.locator('.editor-explicit .tiptap').first()

          await editor.click()
          await editor.type("'world'")

          await expect(editor).toContainText('’world‘')
        })
      })
    })
  })
})
