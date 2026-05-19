import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Youtube'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Nodes'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
          ;(window as any).prompt = () => 'https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share'
        })
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
      })

      test('adds a video', async ({ page }) => {
        await page.locator('#add').click()
        const iframe = page.locator('.tiptap div[data-youtube-video] iframe')
        await expect(iframe).toHaveCount(1)
        const src = await iframe.getAttribute('src')
        expect(src).toBeTruthy()
        const url = new URL(src as string)
        expect(`${url.origin}${url.pathname}`).toBe('https://www.youtube-nocookie.com/embed/hBp4dgE7Bho')
      })

      test('adds a video with 320x240 size', async ({ page }) => {
        await page.locator('#width').fill('320')
        await page.locator('#height').fill('240')
        await page.locator('#add').click()
        const iframe = page.locator('.tiptap div[data-youtube-video] iframe')
        await expect(iframe).toHaveCSS('width', '320px')
        await expect(iframe).toHaveCSS('height', '240px')
      })
    })
  })
})
