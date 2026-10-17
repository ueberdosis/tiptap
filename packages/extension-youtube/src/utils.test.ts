import { describe, expect, it } from 'vite-plus/test'

import {
  getAttributesFromYoutubeEmbedUrl,
  getEmbedUrlFromYoutubeUrl,
  isValidYoutubeUrl,
} from './utils.js'

describe('YouTube Live URL handling', () => {
  it('generates correct embed URL for a YouTube Live URL', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/live/EkRHhOCdZjw',
      controls: true,
    })

    expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw')
  })

  it('generates correct embed URL for a YouTube Live URL without www prefix', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://youtube.com/live/EkRHhOCdZjw',
      controls: true,
      autoplay: true,
    })

    expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw?autoplay=1')
  })

  it('generates correct embed URL for a YouTube Live URL with multiple parameters', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/live/EkRHhOCdZjw',
      autoplay: true,
      controls: false,
      rel: 0,
    })

    expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw?autoplay=1&controls=0&rel=0')
  })

  it('generates correct embed URL for a YouTube Live URL with nocookie option', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/live/EkRHhOCdZjw',
      nocookie: true,
      controls: true,
      rel: 1,
    })

    expect(result).toBe('https://www.youtube-nocookie.com/embed/EkRHhOCdZjw?rel=1')
  })

  it('keeps a live URL with a query string on the video id', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/live/EkRHhOCdZjw?feature=share',
      controls: true,
    })

    expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw')
  })
})

describe('YouTube path-like near misses', () => {
  const nearMisses = [
    'https://www.youtube.com/notlive/EkRHhOCdZjw',
    'https://www.youtube.com/notshorts/EkRHhOCdZjw',
    'https://www.youtube.com/watch?redirect=live/EkRHhOCdZjw',
  ]

  nearMisses.forEach(url => {
    it(`does not embed a video id for ${url}`, () => {
      expect(getEmbedUrlFromYoutubeUrl({ url, controls: true })).toBe(null)
    })
  })
})

describe('YouTube Shorts URL handling', () => {
  it('generates correct embed URL for YouTube Shorts with rel parameter', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/shorts/EkRHhOCdZjw',
      controls: true,
      rel: 1,
    })

    expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw?rel=1')
  })

  it('generates correct embed URL for YouTube Shorts without www prefix', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://youtube.com/shorts/EkRHhOCdZjw',
      controls: true,
      autoplay: true,
    })

    expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw?autoplay=1')
  })

  it('generates correct embed URL for YouTube Shorts with multiple parameters', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/shorts/EkRHhOCdZjw',
      autoplay: true,
      controls: false,
      rel: 0,
    })

    expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw?autoplay=1&controls=0&rel=0')
  })

  it('generates correct embed URL for YouTube Shorts with nocookie option', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/shorts/EkRHhOCdZjw',
      nocookie: true,
      controls: true,
      rel: 1,
    })

    expect(result).toBe('https://www.youtube-nocookie.com/embed/EkRHhOCdZjw?rel=1')
  })

  it('generates correct embed URL for YouTube Shorts without extra parameters', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/shorts/EkRHhOCdZjw',
      controls: true,
    })

    expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw')
  })
})

describe('YouTube Playlist URL handling', () => {
  it('generates correct embed URL for playlist with additional parameters using & separator', () => {
    const result = getEmbedUrlFromYoutubeUrl({
      url: 'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
      controls: true,
      autoplay: true,
    })

    // Playlist URLs use ?list= in base URL, so additional params should use &
    expect(result).toBe(
      'https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf&autoplay=1',
    )
  })
})

it.each([
  'https://www.youtube.com/embed/',
  'https://www.youtube.com/embed/videoseries',
  'https://example.com/embed/dQw4w9WgXcQ',
])('returns null for unsupported youtube embed urls: %s', embedUrl => {
  expect(getAttributesFromYoutubeEmbedUrl(embedUrl)).toBeNull()
})

describe('missing URLs', () => {
  it('accepts a well-formed youtube url', () => {
    expect(isValidYoutubeUrl('https://www.youtube.com/watch?v=EkRHhOCdZjw')).toBeTruthy()
  })

  it('returns null for a missing url instead of throwing', () => {
    expect(isValidYoutubeUrl(null)).toBe(null)
  })

  it('returns null from getEmbedUrlFromYoutubeUrl when the url is missing', () => {
    expect(getEmbedUrlFromYoutubeUrl({ url: null as unknown as string })).toBe(null)
  })
})
