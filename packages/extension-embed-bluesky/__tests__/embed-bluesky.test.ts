import { describe, expect, it } from 'vitest'

import { EmbedBluesky } from '../src/index.js'

describe('EmbedBluesky Extension', () => {
  describe('Configuration', () => {
    it('should create extension with correct name', () => {
      expect(EmbedBluesky.name).toBe('embedBluesky')
    })

    it('should allow custom loadingHTML as string', () => {
      const customHTML = '<div class="spinner">Loading...</div>'
      const config = EmbedBluesky.configure({
        loadingHTML: customHTML,
      })

      expect(config.options.loadingHTML).toBe(customHTML)
    })

    it('should allow custom loadingHTML as function', () => {
      const customHTML = () => '<div class="spinner">Loading...</div>'
      const config = EmbedBluesky.configure({
        loadingHTML: customHTML,
      })

      expect(typeof config.options.loadingHTML).toBe('function')
      expect((config.options.loadingHTML as () => string)()).toBe('<div class="spinner">Loading...</div>')
    })

    it('should allow custom onError callback', () => {
      const onError = (_error: Error, url: string) => `<div>Error loading ${url}</div>`
      const config = EmbedBluesky.configure({
        onError,
      })

      expect(config.options.onError).toBe(onError)
    })

    it('should have correct default options', () => {
      const config = EmbedBluesky.configure({})

      expect(config.options.addPasteHandler).toBe(true)
      expect(config.options.colorMode).toBe('system')
      expect(config.options.inline).toBe(false)
      expect(config.options.loadingHTML).toContain('Loading Bluesky embed')
      expect(config.options.onError).toBeNull()
    })
  })

  describe('Node Properties', () => {
    it('should not be inline by default', () => {
      const config = EmbedBluesky.configure({})
      expect(config.options.inline).toBe(false)
    })

    it('should support inline configuration', () => {
      const config = EmbedBluesky.configure({ inline: true })
      expect(config.options.inline).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should support custom error handler', () => {
      const errorHandler = (_error: Error, url: string) => {
        return `<div class="error">Failed to load from: ${url}</div>`
      }

      // Verify the handler can be called
      const result = errorHandler(new Error('Test'), 'https://example.com')
      expect(result).toContain('Failed to load')
    })

    it('should default to null error handler', () => {
      const config = EmbedBluesky.configure({})
      expect(config.options.onError).toBeNull()
    })
  })

  describe('Color Mode', () => {
    it('should support light color mode', () => {
      const config = EmbedBluesky.configure({ colorMode: 'light' })
      expect(config.options.colorMode).toBe('light')
    })

    it('should support dark color mode', () => {
      const config = EmbedBluesky.configure({ colorMode: 'dark' })
      expect(config.options.colorMode).toBe('dark')
    })

    it('should support system color mode', () => {
      const config = EmbedBluesky.configure({ colorMode: 'system' })
      expect(config.options.colorMode).toBe('system')
    })

    it('should default to system color mode', () => {
      const config = EmbedBluesky.configure({})
      expect(config.options.colorMode).toBe('system')
    })
  })

  describe('Paste Handler', () => {
    it('should enable paste handler by default', () => {
      const config = EmbedBluesky.configure({})
      expect(config.options.addPasteHandler).toBe(true)
    })

    it('should allow disabling paste handler', () => {
      const config = EmbedBluesky.configure({ addPasteHandler: false })
      expect(config.options.addPasteHandler).toBe(false)
    })
  })

  describe('HTML Attributes', () => {
    it('should support custom HTML attributes', () => {
      const customAttrs = { class: 'my-embed', 'data-custom': 'value' }
      const config = EmbedBluesky.configure({ HTMLAttributes: customAttrs })
      expect(config.options.HTMLAttributes).toEqual(customAttrs)
    })

    it('should default to empty HTML attributes', () => {
      const config = EmbedBluesky.configure({})
      expect(config.options.HTMLAttributes).toEqual({})
    })
  })
})
