/**
 * Regular expression to match URLs pointing to common audio file formats.
 * Matches http/https URLs ending in: mp3, wav, ogg, oga, flac, m4a, aac, opus, weba, webm.
 * Supports optional query strings. Case-insensitive, single match.
 */
export const AUDIO_URL_REGEX = /https?:\/\/[^\s]+?\.(?:mp3|wav|ogg|oga|flac|m4a|aac|opus|weba|webm)(?:\?[^\s]*)?/i

/**
 * Global variant of AUDIO_URL_REGEX for matching multiple audio URLs in a string.
 * Use this when you need to find all audio URLs in a block of text.
 */
export const AUDIO_URL_REGEX_GLOBAL =
  /https?:\/\/[^\s]+?\.(?:mp3|wav|ogg|oga|flac|m4a|aac|opus|weba|webm)(?:\?[^\s]*)?/gi

/**
 * Regular expression to match base64-encoded audio data URLs.
 */
const AUDIO_DATA_URL_REGEX = /^data:audio\/[a-zA-Z0-9.+-]+;base64,/i

/**
 * Validates whether a URL is safe for use in an audio element.
 * Allows http, https, protocol-relative, and relative paths by default.
 * Data URLs can be enabled via the allowBase64 flag.
 *
 * @param url - The URL string to validate
 * @param allowBase64 - Whether to allow base64 data URLs (default: false)
 * @returns True if the URL is valid and safe, false otherwise
 */
export const isValidAudioUrl = (url: string, allowBase64 = false) => {
  if (!url) {
    return false
  }

  if (allowBase64 && AUDIO_DATA_URL_REGEX.test(url)) {
    return true
  }

  if (url.startsWith('//')) {
    return true
  }

  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true
  }

  try {
    const parsedUrl = new URL(url)

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Sanitizes an audio source URL by validating it against allowed protocols.
 * Returns null for invalid or potentially unsafe URLs.
 *
 * @param url - The URL string to sanitize (can be null or undefined)
 * @param allowBase64 - Whether to allow base64 data URLs (default: false)
 * @returns The original URL if valid, or null if invalid/unsafe
 */
export const sanitizeAudioSrc = (url: string | null | undefined, allowBase64 = false) => {
  if (!url) {
    return null
  }

  return isValidAudioUrl(url, allowBase64) ? url : null
}
