import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  extractBlueskeyDataFromUrl,
  isValidBlueskeyUrl,
  loadBlueskeyEmbedScript,
  resolveBlueskeyEmbed,
} from '../src/utils.js'

describe('Bluesky Embed Utils', () => {
  describe('isValidBlueskeyUrl', () => {
    it('should validate correct Bluesky URLs', () => {
      const validUrls = [
        'https://bsky.app/profile/user.bsky.social/post/3lnzavsbkvs2x',
        'https://bsky.app/profile/tiptap.dev/post/3lnzavsbkvs2x',
        'https://bsky.app/profile/dominik.is/post/3lvf7vvsaq22v',
      ]

      validUrls.forEach(url => {
        expect(isValidBlueskeyUrl(url)).toBe(true)
      })
    })

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://twitter.com/user/status/123',
        'https://example.com/post',
        'not-a-url',
        'https://bsky.app/feed/timeline',
        '',
        'bsky.app/profile/user.bsky.social/post/3lnzavsbkvs2x', // missing https://
      ]

      invalidUrls.forEach(url => {
        expect(isValidBlueskeyUrl(url)).toBe(false)
      })
    })

    it('should handle URLs with query parameters', () => {
      const urlWithParams = 'https://bsky.app/profile/user.bsky.social/post/3lnzavsbkvs2x?lang=en'
      expect(isValidBlueskeyUrl(urlWithParams)).toBe(true)
    })

    it('should reject URLs with fragments', () => {
      const urlWithFragment = 'https://bsky.app/profile/user.bsky.social/post/3lnzavsbkvs2x#comments'
      expect(isValidBlueskeyUrl(urlWithFragment)).toBe(false)
    })
  })

  describe('extractBlueskeyDataFromUrl', () => {
    it('should extract handle and postId from valid URL', () => {
      const url = 'https://bsky.app/profile/tiptap.dev/post/3lnzavsbkvs2x'
      const data = extractBlueskeyDataFromUrl(url)

      expect(data).not.toBeNull()
      expect(data?.profileHandle).toBe('tiptap.dev')
      expect(data?.postId).toBe('3lnzavsbkvs2x')
    })

    it('should extract from URL without protocol', () => {
      const url = 'bsky.app/profile/user.bsky.social/post/3lnzavsbkvs2x'
      const data = extractBlueskeyDataFromUrl(url)

      expect(data).toBeNull()
    })

    it('should extract from URL with query parameters', () => {
      const url = 'https://bsky.app/profile/dominik.is/post/3lvf7vvsaq22v?ref_src=embed'
      const data = extractBlueskeyDataFromUrl(url)

      expect(data).not.toBeNull()
      expect(data?.profileHandle).toBe('dominik.is')
      expect(data?.postId).toBe('3lvf7vvsaq22v')
    })

    it('should return null for invalid URLs', () => {
      const invalidUrls = ['https://twitter.com/user/status/123', 'https://example.com/post', 'not-a-url']

      invalidUrls.forEach(url => {
        expect(extractBlueskeyDataFromUrl(url)).toBeNull()
      })
    })

    it('should extract handles with dots', () => {
      const url = 'https://bsky.app/profile/user.bsky.social/post/3lnzavsbkvs2x'
      const data = extractBlueskeyDataFromUrl(url)

      expect(data).not.toBeNull()
      expect(data?.profileHandle).toBe('user.bsky.social')
    })
  })

  describe('resolveBlueskeyEmbed', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should resolve valid post URL to uri and cid', async () => {
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      // Mock profile API response
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            did: 'did:plc:test123',
            handle: 'user.bsky.social',
          }),
          { status: 200 },
        ),
      )

      // Mock post API response
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            thread: {
              post: {
                uri: 'at://did:plc:test123/app.bsky.feed.post/abc123',
                cid: 'bafy123',
              },
            },
          }),
          { status: 200 },
        ),
      )

      const url = 'https://bsky.app/profile/user.bsky.social/post/abc123'
      const result = await resolveBlueskeyEmbed(url)

      expect(result).not.toBeNull()
      expect(result?.uri).toBe('at://did:plc:test123/app.bsky.feed.post/abc123')
      expect(result?.cid).toBe('bafy123')
    })

    it('should return null for invalid URL', async () => {
      const url = 'https://twitter.com/user/status/123'
      const result = await resolveBlueskeyEmbed(url)

      expect(result).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      // Mock profile API error
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }))

      const url = 'https://bsky.app/profile/nonexistent.bsky.social/post/abc123'
      const result = await resolveBlueskeyEmbed(url)

      expect(result).toBeNull()
    })

    it('should handle network errors', async () => {
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const url = 'https://bsky.app/profile/user.bsky.social/post/abc123'
      const result = await resolveBlueskeyEmbed(url)

      expect(result).toBeNull()
    })

    it('should call profile API with correct handle', async () => {
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ did: 'did:plc:test' }), { status: 200 }))

      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            thread: {
              post: {
                uri: 'at://did:plc:test/app.bsky.feed.post/abc',
                cid: 'bafy',
              },
            },
          }),
          { status: 200 },
        ),
      )

      const url = 'https://bsky.app/profile/myhandle.bsky.social/post/abc123'
      await resolveBlueskeyEmbed(url)

      // Check calls made - exact format with full URLs
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch.mock.calls[0][0]).toContain('actor=myhandle.bsky.social')
      expect(mockFetch.mock.calls[1][0]).toContain('app.bsky.feed.getPostThread')
    })

    it('should call post API with resolved DID', async () => {
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ did: 'did:plc:resolved123' }), { status: 200 }))

      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            thread: {
              post: {
                uri: 'at://did:plc:resolved123/app.bsky.feed.post/postid123',
                cid: 'bafy456',
              },
            },
          }),
          { status: 200 },
        ),
      )

      const url = 'https://bsky.app/profile/user.bsky.social/post/postid123'
      await resolveBlueskeyEmbed(url)

      // Check second call uses resolved DID (URL-encoded in the uri parameter)
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch.mock.calls[1][0]).toContain('uri=at%3A%2F%2Fdid%3Aplc%3Aresolved123')
    })
  })

  describe('loadBlueskeyEmbedScript', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Clear any existing script from DOM
      const existingScript = document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    })

    it('should create script tag with correct src', () => {
      loadBlueskeyEmbedScript()

      const script = document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]')
      expect(script).toBeTruthy()
    })

    it('should set script attributes correctly', () => {
      loadBlueskeyEmbedScript()

      const script = document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]') as HTMLScriptElement
      expect(script.async).toBe(true)
      expect(script.charset).toBe('utf-8')
    })

    it('should append script to document head', () => {
      loadBlueskeyEmbedScript()

      const script = document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]')
      expect(script?.parentElement).toBe(document.head)
    })

    it('should not create duplicate scripts', () => {
      loadBlueskeyEmbedScript()
      loadBlueskeyEmbedScript()
      loadBlueskeyEmbedScript()

      const scripts = document.querySelectorAll('script[src="https://embed.bsky.app/static/embed.js"]')
      expect(scripts.length).toBe(1)
    })

    it('should reuse existing script on subsequent calls', () => {
      loadBlueskeyEmbedScript()
      const firstScript = document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]')

      loadBlueskeyEmbedScript()
      const secondScript = document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]')

      expect(firstScript).toBe(secondScript)
    })
  })
})
