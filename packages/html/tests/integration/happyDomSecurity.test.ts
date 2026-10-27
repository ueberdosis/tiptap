// @vitest-environment node

import { Window } from 'happy-dom'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'

describe('Happy DOM module evaluation', () => {
  it('does not execute an initializer injected through an invalid import alias', async () => {
    const localWindow = new Window({
      url: 'https://happy-dom.test/',
      settings: {
        enableJavaScriptEvaluation: true,
        suppressCodeGenerationFromStringsWarning: true,
        fetch: {
          virtualServers: [
            {
              url: 'https://happy-dom.test/',
              directory: fileURLToPath(new URL('../fixtures/files/', import.meta.url)),
            },
          ],
        },
      },
    })

    try {
      const script = localWindow.document.createElement('script')
      script.type = 'module'
      script.textContent = `
        import {
          missing as injected = globalThis.document.body.setAttribute(\`data-injected\`, \`true\`)
        } from './empty.json' with { type: 'json' };
        globalThis.document.body.setAttribute('data-completed', 'true');
      `

      localWindow.document.body.appendChild(script)
      await localWindow.happyDOM.waitUntilComplete()

      expect(localWindow.document.body.hasAttribute('data-injected')).toBe(false)
      expect(localWindow.document.body.getAttribute('data-completed')).toBe('true')
    } finally {
      await localWindow.happyDOM.close()
    }
  })
})
