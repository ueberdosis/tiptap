export const isValidYouTubeUrl = (url: string) => {
  return url.match(/^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)(.+)?$/)
}

export interface GetEmbedUrlOptions {
  url: string;
  controls?: boolean;
  nocookie?: boolean;
  startAt?: number;
}

export const getEmbedURLFromYouTubeURL = (options: GetEmbedUrlOptions) => {
  const {
    url,
    controls,
    nocookie,
    startAt,
  } = options

  // if is already an embed url, return it
  if (url.includes('/embed/')) {
    return url
  }

  const videoIdRegex = /v=([-\w]+)/gm
  const matches = videoIdRegex.exec(url)

  if (!matches || !matches[1]) {
    return null
  }

  let outputUrl = nocookie ? `https://www.youtube-nocookie.com/embed/${matches[1]}` : `https://www.youtube.com/embed/${matches[1]}`

  const params = []

  if (!controls) {
    params.push('controls=0')
  }

  if (startAt) {
    params.push(`start=${startAt}`)
  }

  if (params.length) {
    outputUrl += `?${params.join('&')}`
  }

  return outputUrl
}
