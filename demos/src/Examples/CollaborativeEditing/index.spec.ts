import { Server } from '@hocuspocus/server'
import { expect, test as base } from '@playwright/test'

type CollaborationServer = {
  authenticatedDocuments: string[]
}

const test = base.extend<{ collaborationServer: CollaborationServer }>({
  collaborationServer: async ({ context }, use) => {
    const authenticatedDocuments: string[] = []
    const server = new Server({
      port: 0,
      address: '127.0.0.1',
      quiet: true,
      stopOnSignals: false,
      async onAuthenticate({ token, documentName }) {
        if (token !== 'notoken') {
          throw new Error('Unexpected demo authentication token')
        }

        authenticatedDocuments.push(documentName)
      },
    })

    await server.listen()
    await context.addInitScript(serverUrl => {
      const NativeWebSocket = window.WebSocket

      window.WebSocket = class extends NativeWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          const isCloud = new URL(url).origin === 'wss://7j9y6m10.collab.tiptap.cloud'
          super(isCloud ? serverUrl : url, protocols)
        }
      }

      if (location.pathname.includes('/Examples/CollaborativeEditing/')) {
        Math.random = () => 0.5
      }
    }, server.webSocketURL)

    try {
      await use({ authenticatedDocuments })
    } finally {
      await context.close()
      await server.destroy()
    }
  },
})

const demos = [
  { path: 'Examples/CollaborativeEditing/React', room: /^rooms\./ },
  { path: 'Examples/CollaborativeEditing/Vue', room: /^rooms\./ },
  { path: 'Demos/SingleRoomCollab/React', room: /^room-1$/ },
  { path: 'Demos/CollaborationSplitPane/React', room: /^room\.\d+-ok$/, splitPane: true },
  { path: 'Tutorials/1-4-collab/React', room: /^note-[12]$/, notes: true },
  { path: 'Tutorials/1-4-collab/Vue', room: /^note-[12]$/, notes: true },
  {
    path: 'Tutorials/1-3-yjs_lexical/Lexical-React',
    room: /^note-[12]$/,
    notes: true,
    lexical: true,
  },
]

for (const demo of demos) {
  test(`${demo.path} authenticates and synchronizes editors`, async ({
    page,
    context,
    collaborationServer,
  }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/src/${demo.path}/`)

    const peer = demo.splitPane ? page : await context.newPage()
    if (peer !== page) {
      peer.on('pageerror', error => errors.push(error.message))
      await peer.goto(`/src/${demo.path}/`)
    }

    const selector = demo.lexical ? '[contenteditable="true"]' : '.tiptap'
    const editor = page.locator(selector).first()
    const peerEditor = peer.locator(selector).nth(demo.splitPane ? 1 : 0)
    const expectedConnections = demo.notes ? 4 : 2

    await expect
      .poll(() => collaborationServer.authenticatedDocuments.length)
      .toBe(expectedConnections)
    for (const name of collaborationServer.authenticatedDocuments) {
      expect(name).toMatch(demo.room)
    }

    if (demo.lexical) {
      await expect(editor.locator('p')).toHaveCount(1)
      await expect(peerEditor.locator('p')).toHaveCount(1)
    }

    await editor.focus()
    await editor.press('ControlOrMeta+End')
    await editor.pressSequentially('Hello from the first editor')
    await expect(editor).toContainText('Hello from the first editor')
    await expect(peerEditor).toContainText('Hello from the first editor')

    await peerEditor.focus()
    await peerEditor.press('ControlOrMeta+End')
    await peerEditor.pressSequentially(' and back from the second')
    await expect(editor).toContainText('and back from the second')

    if (demo.notes) {
      await expect(page.locator(selector).nth(1)).not.toContainText('Hello from the first editor')
      await expect(peer.locator(selector).nth(1)).not.toContainText('and back from the second')
    } else if (demo.splitPane) {
      await expect(page.locator('.collab-status-group').first()).toContainText('2 users online')
    } else {
      await expect(page.locator('.editor__status').first()).toContainText('2 users online')
    }

    expect(errors).toEqual([])
  })
}
