import { expect, it } from 'vite-plus/test'

import { getAttributesFromTwitchEmbedUrl, isValidTwitchUrl } from './utils.js'

it.each([
  'https://player.twitch.tv/?video=abc&parent=example.com',
  'https://player.twitch.tv/?channel=foo%2Fbar&parent=example.com',
  'https://clips.twitch.tv/embed?clip=bad%20clip&parent=example.com',
])('returns null for malformed embed identifiers: %s', embedUrl => {
  expect(getAttributesFromTwitchEmbedUrl(embedUrl)).toBeNull()
})

it.each([
  'https://www.twitch.tv/',
  'https://twitch.tv',
  'https://www.twitch.tv/?filter=archives',
  'https://clips.twitch.tv/',
])('rejects Twitch URLs without a video, clip or channel: %s', url => {
  expect(isValidTwitchUrl(url)).toBeNull()
})
