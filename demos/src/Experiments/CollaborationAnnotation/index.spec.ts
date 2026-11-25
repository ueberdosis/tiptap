import { expect, test } from '@playwright/test'
import type { Editor } from '@tiptap/core'

const demoName = 'CollaborationAnnotation'
const frameworkPaths = ['Vue']
const demoPath = '/src/Experiments'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders two editors', async ({ page }) => {
        await expect(page.locator('.tiptap')).toHaveCount(2)
        await expect(page.locator('.editor-1 img')).toBeVisible()
        const clientIds = await page
          .locator('.tiptap')
          .evaluateAll(elements =>
            elements.map(
              element =>
                (
                  element as HTMLElement & { editor: Editor }
                ).editor.extensionManager.extensions.find(
                  extension => extension.name === 'collaboration',
                )!.options.document.clientID,
            ),
          )
        expect(clientIds[0]).not.toBe(clientIds[1])
        await page.screenshot({ path: '/tmp/tiptap-annotation-demo-desktop.png', fullPage: true })
      })

      test('fits a narrow screen', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await expect(page.getByRole('region', { name: 'Client 1' })).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          390,
        )
        await page.screenshot({ path: '/tmp/tiptap-annotation-demo-mobile.png', fullPage: true })
      })

      test('reuses untouched blocks after remote typing', async ({ page }) => {
        const first = page.locator('.editor-1 .tiptap')
        const second = page.locator('.editor-2 .tiptap')
        await expect(second.locator('p').first()).toContainText('Select some text')
        const before = await second.evaluateHandle(
          element => (element as HTMLElement & { editor: Editor }).editor.state.doc,
        )

        await first.evaluate(element =>
          (element as HTMLElement & { editor: Editor }).editor.commands.setTextSelection(1),
        )
        await first.pressSequentially('!')
        await expect(second.locator('p').first()).toContainText('!Select some text')

        expect(
          await second.evaluate((element, oldDoc) => {
            const doc = (element as HTMLElement & { editor: Editor }).editor.state.doc

            return {
              changed: doc.child(0) !== oldDoc.child(0),
              image: doc.child(1) === oldDoc.child(1),
              paragraph: doc.child(2) === oldDoc.child(2),
              list: doc.child(3) === oldDoc.child(3),
            }
          }, before),
        ).toEqual({ changed: true, image: true, paragraph: true, list: true })
        await before.dispose()
      })

      test('leaves a comment unresolved when a paragraph split replaces its text', async ({
        page,
      }) => {
        const first = page.locator('.editor-1 .tiptap')
        const second = page.locator('.editor-2 .tiptap')
        await first.fill('Select some text')
        await expect(second).toHaveText('Select some text')
        await first.evaluate(element =>
          (element as HTMLElement & { editor: Editor }).editor.commands.setTextSelection({
            from: 13,
            to: 17,
          }),
        )

        await page.getByRole('button', { name: 'Annotate', exact: true }).first().click()
        await expect(first.locator('.annotation')).toHaveText('text')
        await expect(second.locator('.annotation')).toHaveText('text')
        const stored = await page.getByTestId('annotations-0').textContent()
        await first.focus()
        await first.evaluate(element =>
          (element as HTMLElement & { editor: Editor }).editor.commands.setTextSelection(8),
        )

        await first.press('Enter')
        await expect(first.locator('p')).toHaveCount(2)
        await expect(second.locator('p')).toHaveCount(2)
        await expect(first.locator('.annotation')).toHaveCount(0)
        await expect(second.locator('.annotation')).toHaveCount(0)
        await expect(page.getByText('text · Unresolved', { exact: true })).toHaveCount(2)
        expect(await page.getByTestId('annotations-0').textContent()).toEqual(stored)
        expect(await page.getByTestId('annotations-1').textContent()).toEqual(stored)
      })

      test('stores annotations outside the document and synchronizes both clients', async ({
        page,
      }) => {
        const first = page.locator('.editor-1 .tiptap')
        const second = page.locator('.editor-2 .tiptap')
        const before = await first.evaluate(element =>
          (element as HTMLElement & { editor: Editor }).editor.getJSON(),
        )
        await first.evaluate(element =>
          (element as HTMLElement & { editor: Editor }).editor.commands.setTextSelection({
            from: 13,
            to: 17,
          }),
        )
        await page.getByLabel('Annotation', { exact: true }).first().fill('A shared annotation')
        await page.getByRole('button', { name: 'Annotate', exact: true }).first().click()

        await expect(first.locator('.annotation')).toHaveText('text')
        await expect(second.locator('.annotation')).toHaveText('text')
        await expect(page.getByTestId('annotations-1')).toContainText('A shared annotation')
        expect(await page.getByTestId('annotations-0').textContent()).toEqual(
          await page.getByTestId('annotations-1').textContent(),
        )
        const stored = JSON.parse((await page.getByTestId('annotations-0').textContent())!)
        expect(Object.values(stored)).toEqual([
          expect.objectContaining({ kind: 'text', from: expect.any(Array), to: expect.any(Array) }),
        ])
        expect(
          await first.evaluate(element =>
            (element as HTMLElement & { editor: Editor }).editor.getJSON(),
          ),
        ).toEqual(before)
        expect(
          await second.evaluate(element =>
            (element as HTMLElement & { editor: Editor }).editor.getJSON(),
          ),
        ).toEqual(before)

        await page
          .getByRole('region', { name: 'Client 2' })
          .getByRole('button', { name: 'Remove', exact: true })
          .click()
        await expect(first.locator('.annotation')).toHaveCount(0)
        await expect(second.locator('.annotation')).toHaveCount(0)
        await expect(page.getByTestId('annotations-0')).toHaveText('{}')
      })

      test('keeps a deleted image annotation unresolved instead of attaching it elsewhere', async ({
        page,
      }) => {
        const first = page.locator('.editor-1 .tiptap')
        const second = page.locator('.editor-2 .tiptap')
        await first.locator('img').click()
        await page.getByRole('button', { name: 'Annotate', exact: true }).first().click()
        await expect(second.locator('img.annotation')).toHaveCount(1)
        const stored = await page.getByTestId('annotations-0').textContent()
        await first.press('Backspace')

        await expect(first.locator('img')).toHaveCount(0)
        await expect(second.locator('img')).toHaveCount(0)
        await expect(page.getByText('node · Unresolved', { exact: true })).toHaveCount(2)
        expect(await page.getByTestId('annotations-0').textContent()).toEqual(stored)
        expect(await page.getByTestId('annotations-1').textContent()).toEqual(stored)
      })
    })
  })
})
