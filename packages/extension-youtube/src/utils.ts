export const YOUTUBE_REGEX = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu\.be|youtube-nocookie\.com))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/
export const YOUTUBE_REGEX_GLOBAL = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu\.be|youtube-nocookie\.com))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/g

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
  rel?: number;
}

export const getYoutubeEmbedUrl = (nocookie?: boolean, isPlaylist?:boolean) => {
  if (isPlaylist) {
    return 'https://www.youtube-nocookie.com/embed/videoseries?list='
  }
  return nocookie ? 'https://www.youtube-nocookie.com/embed/' : 'https://www.youtube.com/embed/'
}

const getYoutubeVideoOrPlaylistId = (
  url: URL,
): { id: string; isPlaylist?: boolean } | null => {
  if (url.searchParams.has('v')) {
    return { id: url.searchParams.get('v')! }
  }

  if (
    url.hostname === 'youtu.be'
    || url.pathname.includes('shorts')
    || url.pathname.includes('live')
  ) {
    return { id: url.pathname.split('/').pop()! }
  }

  if (url.searchParams.has('list')) {
    return { id: url.searchParams.get('list')!, isPlaylist: true }
  }

  return null
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
    rel,
  } = options

  if (!isValidYoutubeUrl(url)) {
    return null
  }

  // if is already an embed url, return it
  if (url.includes('/embed/')) {
    return url
  }

  const urlObject = new URL(url)
  const { id, isPlaylist } = getYoutubeVideoOrPlaylistId(urlObject) ?? {}

  if (!id) { return null }

  const embedUrl = new URL(`${getYoutubeEmbedUrl(nocookie, isPlaylist)}${id}`)

  if (urlObject.searchParams.has('t')) {
    embedUrl.searchParams.set('start', urlObject.searchParams.get('t')!.replaceAll('s', ''))
  }

  if (allowFullscreen === false) {
    embedUrl.searchParams.set('fs', '0')
  }

  if (autoplay) {
    embedUrl.searchParams.set('autoplay', '1')
  }

  if (ccLanguage) {
    embedUrl.searchParams.set('cc_lang_pref', ccLanguage)
  }

  if (ccLoadPolicy) {
    embedUrl.searchParams.set('cc_load_policy', '1')
  }

  if (!controls) {
    embedUrl.searchParams.set('controls', '0')
  }

  if (disableKBcontrols) {
    embedUrl.searchParams.set('disablekb', '1')
  }

  if (enableIFrameApi) {
    embedUrl.searchParams.set('enablejsapi', '1')
  }

  if (endTime) {
    embedUrl.searchParams.set('end', endTime.toString())
  }

  if (interfaceLanguage) {
    embedUrl.searchParams.set('hl', interfaceLanguage)
  }

  if (ivLoadPolicy) {
    embedUrl.searchParams.set('iv_load_policy', ivLoadPolicy.toString())
  }

  if (loop) {
    embedUrl.searchParams.set('loop', '1')
  }

  if (modestBranding) {
    embedUrl.searchParams.set('modestbranding', '1')
  }

  if (origin) {
    embedUrl.searchParams.set('origin', origin)
  }

  if (playlist) {
    embedUrl.searchParams.set('playlist', playlist)
  }

  if (startAt) {
    embedUrl.searchParams.set('start', startAt.toString())
  }

  if (progressBarColor) {
    embedUrl.searchParams.set('color', progressBarColor)
  }

  if (rel !== undefined) {
    embedUrl.searchParams.set('rel', rel.toString())
  }

  return embedUrl.toString()
}
