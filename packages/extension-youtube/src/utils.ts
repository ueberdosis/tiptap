export const YOUTUBE_REGEX = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu.be|youtube-nocookie\.com))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/
export const YOUTUBE_REGEX_GLOBAL = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu.be|youtube-nocookie\.com))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/g

export const isValidYoutubeUrl = (url: string) => {
  return url.match(YOUTUBE_REGEX)
}

export interface GetEmbedUrlOptions {
  url: string;
  allowFullscreen?: boolean;
  autoplay?: boolean;
  ccLanguage?:string;
  ccLoadPolicy?:boolean;
  controls?: boolean;
  disableKBcontrols?: boolean,
  enableIFrameApi?: boolean;
  endTime?: number;
  interfaceLanguage?: string;
  ivLoadPolicy?: number;
  loop?: boolean;
  modestBranding?: boolean;
  nocookie?: boolean;
  origin?: string;
  playlist?: string;
  progressBarColor?: string;
  startAt?: number;
}

export const getYoutubeEmbedUrl = (nocookie?: boolean) => {
  return nocookie ? 'https://www.youtube-nocookie.com/embed/' : 'https://www.youtube.com/embed/'
}

export const getEmbedUrlFromYoutubeUrl = (options: GetEmbedUrlOptions) => {
  const {
    url,
    allowFullscreen,
    autoplay,
    ccLanguage,
    ccLoadPolicy,
    controls,
    disableKBcontrols,
    enableIFrameApi,
    endTime,
    interfaceLanguage,
    ivLoadPolicy,
    loop,
    modestBranding,
    nocookie,
    origin,
    playlist,
    progressBarColor,
    startAt,
  } = options

  if (!isValidYoutubeUrl(url)) {
    return null
  }

  // if is already an embed url, return it
  if (url.includes('/embed/')) {
    return url
  }

  // if is a youtu.be url, get the id after the /
  if (url.includes('youtu.be')) {
    const id = url.split('/').pop()

    if (!id) {
      return null
    }
    return `${getYoutubeEmbedUrl(nocookie)}${id}`
  }

  const videoIdRegex = /(?:v=|shorts\/)([-\w]+)/gm
  const matches = videoIdRegex.exec(url)

  if (!matches || !matches[1]) {
    return null
  }

  let outputUrl = `${getYoutubeEmbedUrl(nocookie)}${matches[1]}`

  const params = []

  if (allowFullscreen === false) {
    params.push('fs=0')
  }

  if (autoplay) {
    params.push('autoplay=1')
  }

  if (ccLanguage) {
    params.push(`cc_lang_pref=${ccLanguage}`)
  }

  if (ccLoadPolicy) {
    params.push('cc_load_policy=1')
  }

  if (!controls) {
    params.push('controls=0')
  }

  if (disableKBcontrols) {
    params.push('disablekb=1')
  }

  if (enableIFrameApi) {
    params.push('enablejsapi=1')
  }

  if (endTime) {
    params.push(`end=${endTime}`)
  }

  if (interfaceLanguage) {
    params.push(`hl=${interfaceLanguage}`)
  }

  if (ivLoadPolicy) {
    params.push(`iv_load_policy=${ivLoadPolicy}`)
  }

  if (loop) {
    params.push('loop=1')
  }

  if (modestBranding) {
    params.push('modestbranding=1')
  }

  if (origin) {
    params.push(`origin=${origin}`)
  }

  if (playlist) {
    params.push(`playlist=${playlist}`)
  }

  if (startAt) {
    params.push(`start=${startAt}`)
  }

  if (progressBarColor) {
    params.push(`color=${progressBarColor}`)
  }

  if (params.length) {
    outputUrl += `?${params.join('&')}`
  }

  return outputUrl
}
