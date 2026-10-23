import { expect, test } from '@playwright/test'

const demos = [
  { path: '/src/Examples/CollaborativeEditing/React/', editors: 1 },
  { path: '/src/Examples/CollaborativeEditing/Vue/', editors: 1 },
  { path: '/src/Demos/SingleRoomCollab/React/', editors: 1 },
  { path: '/src/Demos/CollaborationSplitPane/React/', editors: 2 },
]

for (const demo of demos) {
  test(`${demo.path} keeps cloud authentication after upgrading the provider`, async ({ page }) => {
    const messages: string[] = []
    const errors: string[] = []

    page.on('pageerror', error => errors.push(error.message))
    await page.routeWebSocket('wss://7j9y6m10.collab.tiptap.cloud/**', socket => {
      socket.onMessage(message => messages.push(message.toString()))
    })

    await page.goto(demo.path)

    const editors = page.locator('.tiptap')
    await expect(editors).toHaveCount(demo.editors)
    await expect.poll(() => messages.some(message => message.includes('notoken'))).toBe(true)
    await editors.first().fill('Provider migration')
    await expect(editors.first()).toContainText('Provider migration')
    expect(errors).toEqual([])
  })
}
