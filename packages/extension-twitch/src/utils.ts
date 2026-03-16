/**
 * Regex patterns for matching Twitch URLs
 * Matches:
 * - https://twitch.tv/videos/1234567890
 * - https://www.twitch.tv/videos/1234567890
 * - https://twitch.tv/examplechannel/clip/ClipName-123
 * - https://www.twitch.tv/examplechannel/clip/ClipName-123
 * - https://clips.twitch.tv/ClipName
 * - https://www.clips.twitch.tv/ClipName
 * - https://twitch.tv/examplechannel (channel)
 * - https://www.twitch.tv/examplechannel
 */
export const TWITCH_REGEX =
  /^(https?:\/\/)?(www\.)?(twitch\.tv|clips\.twitch\.tv)\/(?:videos\/(\d+)|(\w+)\/clip\/([\w-]+)|([\w-]+)(?:\/)?)?(\?.*)?$/

export const TWITCH_REGEX_GLOBAL =
  /^(https?:\/\/)?(www\.)?(twitch\.tv|clips\.twitch\.tv)\/(?:videos\/(\d+)|(\w+)\/clip\/([\w-]+)|([\w-]+)(?:\/)?)?(\?.*)?$/g

/**
 * Validates if a URL is a valid Twitch video, clip or channel URL
 *
 * @param url - The URL to validate
 * @returns true if the URL is a valid Twitch URL
 *
 * @example
 * ```ts
 * isValidTwitchUrl('https://www.twitch.tv/videos/1234567890') // true
 * isValidTwitchUrl('https://www.twitch.tv/examplechannel/clip/ExampleClipName') // true
 * isValidTwitchUrl('https://www.twitch.tv/examplechannel') // true
 * isValidTwitchUrl('https://clips.twitch.tv/ExampleClipName') // true
 * isValidTwitchUrl('invalid') // false
 * ```
 */
export const isValidTwitchUrl = (url: string) => {
  return url.match(TWITCH_REGEX)
}

export interface GetEmbedUrlOptions {
  url: string
  allowFullscreen?: boolean
  autoplay?: boolean
  muted?: boolean
  time?: string
  parent?: string
}

/**
 * Extracts the video, clip or channel identifier from a Twitch URL
 *
 * @param url - The Twitch URL
 * @returns Object containing type ('video', 'clip' or 'channel') and ID, or null if invalid
 *
 * @example
 * ```ts
 * getTwitchIdentifier('https://www.twitch.tv/videos/1234567890')
 * // { type: 'video', id: '1234567890' }
 *
 * getTwitchIdentifier('https://www.twitch.tv/examplechannel/clip/ExampleClipName-ABC123')
 * // { type: 'clip', id: 'ExampleClipName-ABC123' }
 *
 * getTwitchIdentifier('https://www.twitch.tv/examplechannel')
 * // { type: 'channel', id: 'examplechannel' }
 * ```
 */
export const getTwitchIdentifier = (url: string): { type: 'video' | 'clip' | 'channel'; id: string } | null => {
  if (!isValidTwitchUrl(url)) {
    return null
  }

  // Remove query parameters
  const cleanUrl = url.split('?')[0]

  // Handle clip URLs from clips.twitch.tv
  if (cleanUrl.includes('clips.twitch.tv/')) {
    const clipRegex = /clips\.twitch\.tv\/([\w-]+)/
    const match = cleanUrl.match(clipRegex)
    return match ? { type: 'clip', id: match[1] } : null
  }

  // Handle twitch.tv URLs
  if (cleanUrl.includes('twitch.tv/')) {
    // Check if it's a video URL (videos/ID)
    const videoRegex = /twitch\.tv\/videos\/(\d+)/
    const videoMatch = cleanUrl.match(videoRegex)
    if (videoMatch) {
      return { type: 'video', id: videoMatch[1] }
    }

    // Check if it's a clip URL (channel/clip/clipname)
    const channelClipRegex = /twitch\.tv\/([\w-]+)\/clip\/([\w-]+)/
    const clipMatch = cleanUrl.match(channelClipRegex)
    if (clipMatch) {
      return { type: 'clip', id: clipMatch[2] }
    }

    // Otherwise it's a channel URL
    const channelRegex = /twitch\.tv\/([\w-]+)(?:\/)?$/
    const channelMatch = cleanUrl.match(channelRegex)
    if (channelMatch) {
      return { type: 'channel', id: channelMatch[1] }
    }
  }

  return null
}

/**
 * Generates an embed URL from a Twitch video, clip or channel URL with optional parameters
 *
 * @param options - The embed URL options
 * @returns The embed URL or null if invalid
 *
 * @example
 * ```ts
 * getEmbedUrlFromTwitchUrl({
 *   url: 'https://www.twitch.tv/videos/1234567890',
 *   parent: 'example.com',
 *   muted: true,
 *   time: '1h2m3s'
 * })
 * // Returns: https://player.twitch.tv/?video=1234567890&parent=example.com&muted=true&time=1h2m3s
 *
 * getEmbedUrlFromTwitchUrl({
 *   url: 'https://www.twitch.tv/examplechannel/clip/ExampleClipName-ABC123',
 *   parent: 'example.com',
 *   autoplay: true,
 *   muted: true
 * })
 * // Returns: https://clips.twitch.tv/embed?clip=ExampleClipName-ABC123&parent=example.com&autoplay=true&muted=true
 *
 * getEmbedUrlFromTwitchUrl({
 *   url: 'https://www.twitch.tv/examplechannel',
 *   parent: 'example.com'
 * })
 * // Returns: https://player.twitch.tv/?channel=examplechannel&parent=example.com
 * ```
 */
export const getEmbedUrlFromTwitchUrl = (options: GetEmbedUrlOptions): string | null => {
  const { url, allowFullscreen = true, autoplay = false, muted = false, time, parent } = options

  const identifier = getTwitchIdentifier(url)

  if (!identifier) {
    return null
  }

  const parentDomain = parent || 'localhost'

  // Handle clip URLs
  if (identifier.type === 'clip') {
    const clipUrl = new URL('https://clips.twitch.tv/embed')
    clipUrl.searchParams.set('clip', identifier.id)
    clipUrl.searchParams.set('parent', parentDomain)

    if (autoplay) {
      clipUrl.searchParams.set('autoplay', 'true')
    }

    if (muted) {
      clipUrl.searchParams.set('muted', 'true')
    }

    return clipUrl.toString()
  }

  // Handle video URLs
  if (identifier.type === 'video') {
    const videoUrl = new URL('https://player.twitch.tv/')
    videoUrl.searchParams.set('video', identifier.id)
    videoUrl.searchParams.set('parent', parentDomain)

    if (allowFullscreen) {
      videoUrl.searchParams.set('allowfullscreen', 'true')
    }

    if (autoplay) {
      videoUrl.searchParams.set('autoplay', 'true')
    }

    if (muted) {
      videoUrl.searchParams.set('muted', 'true')
    }

    if (time) {
      videoUrl.searchParams.set('time', time)
    }

    return videoUrl.toString()
  }

  // Handle channel URLs
  if (identifier.type === 'channel') {
    const channelUrl = new URL('https://player.twitch.tv/')
    channelUrl.searchParams.set('channel', identifier.id)
    channelUrl.searchParams.set('parent', parentDomain)

    if (allowFullscreen) {
      channelUrl.searchParams.set('allowfullscreen', 'true')
    }

    if (autoplay) {
      channelUrl.searchParams.set('autoplay', 'true')
    }

    if (muted) {
      channelUrl.searchParams.set('muted', 'true')
    }

    return channelUrl.toString()
  }

  return null
}
