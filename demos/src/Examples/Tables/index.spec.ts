import type { Locator } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { clickButton, getEditor } from '../../../test/helpers.js'

const demoName = 'Tables'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

async function selectFirstTwoHeaderCells(editor: Locator) {
  await editor.evaluate((el: any) => {
    const { editor: e } = el
    const positions: number[] = []

    e.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'tableHeader') {
        positions.push(pos)
      }
    })

    e.chain().focus().setCellSelection({ anchorCell: positions[0], headCell: positions[1] }).run()
  })
}

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.clearContent()
        })

        await clickButton(page, 'Insert table')
      })

      test('adds a table with three columns and three rows', async ({ page }) => {
        await expect(page.locator('.tiptap table')).toBeVisible()
        await expect(page.locator('.tiptap table tr')).toHaveCount(3)
        await expect(page.locator('.tiptap table th')).toHaveCount(3)
        await expect(page.locator('.tiptap table td')).toHaveCount(6)
      })

      test('adds & deletes columns', async ({ page }) => {
        await clickButton(page, 'Add column before')
        await expect(page.locator('.tiptap table th')).toHaveCount(4)

        await clickButton(page, 'Add column after')
        await expect(page.locator('.tiptap table th')).toHaveCount(5)

        await clickButton(page, 'Delete column')
        await clickButton(page, 'Delete column')
        await expect(page.locator('.tiptap table th')).toHaveCount(3)
      })

      test('adds & deletes rows', async ({ page }) => {
        await clickButton(page, 'Add row before')
        await expect(page.locator('.tiptap table tr')).toHaveCount(4)

        await clickButton(page, 'Add row after')
        await expect(page.locator('.tiptap table tr')).toHaveCount(5)

        await clickButton(page, 'Delete row')
        await clickButton(page, 'Delete row')
        await expect(page.locator('.tiptap table tr')).toHaveCount(3)
      })

      test('should delete table', async ({ page }) => {
        await clickButton(page, 'Delete table')
        await expect(page.locator('.tiptap table')).toHaveCount(0)
      })

      test('should merge cells', async ({ page }) => {
        const editor = await getEditor(page)

        await selectFirstTwoHeaderCells(editor)
        await clickButton(page, 'Merge cells')

        await expect(page.locator('.tiptap table th')).toHaveCount(2)
      })

      test('should split cells', async ({ page }) => {
        const editor = await getEditor(page)

        await selectFirstTwoHeaderCells(editor)
        await clickButton(page, 'Merge cells')
        await expect(page.locator('.tiptap table th')).toHaveCount(2)

        await clickButton(page, 'Split cell')
        await expect(page.locator('.tiptap table th')).toHaveCount(3)
      })

      test('should toggle header columns', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.toggleHeaderColumn()
        })

        await expect(page.locator('.tiptap table th')).toHaveCount(5)
      })

      test('should toggle header row', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.toggleHeaderRow()
        })

        await expect(page.locator('.tiptap table th')).toHaveCount(0)
      })

      test('should merge split', async ({ page }) => {
        const editor = await getEditor(page)

        await selectFirstTwoHeaderCells(editor)
        await clickButton(page, 'Merge cells')
        await expect(page.locator('.tiptap th[colspan="2"]')).toBeVisible()

        await clickButton(page, 'Merge or split')
        await expect(page.locator('.tiptap th[colspan="2"]')).toHaveCount(0)
      })

      test('should set cell attribute', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          const { editor: e } = el
          let firstCellPos = -1

          e.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'tableCell' && firstCellPos === -1) {
              firstCellPos = pos
            }
          })

          e.chain()
            .focus()
            .setTextSelection(firstCellPos + 1)
            .run()
        })
        await clickButton(page, 'Set cell attribute')

        await expect(page.locator('.tiptap table td[style]').first()).toHaveAttribute(
          'style',
          'background-color: #FAF594',
        )
      })

      test('should move focus to next or prev cell', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          const { editor: e } = el
          let firstHeaderPos = -1

          e.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'tableHeader' && firstHeaderPos === -1) {
              firstHeaderPos = pos
            }
          })

          e.chain()
            .focus()
            .setTextSelection(firstHeaderPos + 1)
            .insertContent('Column 1')
            .run()
        })

        await clickButton(page, 'Go to next cell')

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('Column 2')
        })

        await clickButton(page, 'Go to previous cell')

        const ths = page.locator('.tiptap th')
        await expect(ths.nth(0)).toContainText('Column 1')
        await expect(ths.nth(1)).toContainText('Column 2')
      })
    })
  })
})
