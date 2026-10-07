import { expect, it } from 'vite-plus/test'

import { getAttributesFromTwitchEmbedUrl } from './utils.js'

it.each([
  'https://player.twitch.tv/?video=abc&parent=example.com',
  'https://player.twitch.tv/?channel=foo%2Fbar&parent=example.com',
  'https://clips.twitch.tv/embed?clip=bad%20clip&parent=example.com',
])('returns null for malformed embed identifiers: %s', embedUrl => {
  expect(getAttributesFromTwitchEmbedUrl(embedUrl)).toBeNull()
})
