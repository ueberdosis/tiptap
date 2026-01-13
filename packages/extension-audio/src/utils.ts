export const AUDIO_URL_REGEX = /https?:\/\/[^\s]+?\.(?:mp3|wav|ogg|oga|flac|m4a|aac|opus|weba|webm)(?:\?[^\s]*)?/i
export const AUDIO_URL_REGEX_GLOBAL =
  /https?:\/\/[^\s]+?\.(?:mp3|wav|ogg|oga|flac|m4a|aac|opus|weba|webm)(?:\?[^\s]*)?/gi

const AUDIO_DATA_URL_REGEX = /^data:audio\/[a-zA-Z0-9.+-]+;base64,/i

/**
 * Ensures the provided URL is safe for use in an audio element.
 * Allows http, https, protocol-relative, and relative paths by default.
 * Data URLs can be enabled via the allowBase64 flag.
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

export const sanitizeAudioSrc = (url: string | null | undefined, allowBase64 = false) => {
  if (!url) {
    return null
  }

  return isValidAudioUrl(url, allowBase64) ? url : null
}
