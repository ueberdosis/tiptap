import dataSource from 'emoji-datasource/emoji.json' with { type: 'json' }
import data from 'emojibase-data/en/data.json' with { type: 'json' }
import messages from 'emojibase-data/en/messages.json' with { type: 'json' }
import emojibaseShortcodes from 'emojibase-data/en/shortcodes/emojibase.json' with { type: 'json' }
import gitHubShortcodes from 'emojibase-data/en/shortcodes/github.json' with { type: 'json' }
import fs from 'fs'
import json5 from 'json5'

import type { EmojiItem } from './emoji.js'
import { removeVariationSelector } from './helpers/removeVariationSelector.js'

const emojis: EmojiItem[] = data
  // .filter(emoji => emoji.version > 0 && emoji.version < 14)
  .map(emoji => {
    const dataSourceEmoji = dataSource.find(item => {
      return item.unified === emoji.hexcode || item.non_qualified === emoji.hexcode
    })
    const hasFallbackImage = dataSourceEmoji?.has_img_apple
    const name =
      [(gitHubShortcodes as any)[emoji.hexcode]].flat()[0] || [(emojibaseShortcodes as any)[emoji.hexcode]].flat()[0]
    const shortcodes = (emojibaseShortcodes as any)[emoji.hexcode]
      ? [(emojibaseShortcodes as any)[emoji.hexcode]].flat()
      : []
    const emoticons = emoji.emoticon ? [emoji.emoticon].flat() : []

    return {
      emoji: removeVariationSelector(emoji.emoji),
      name,
      shortcodes,
      tags: emoji.tags || [],
      group: emoji.group ? messages.groups[emoji.group].message : '',
      emoticons,
      version: emoji.version,
      fallbackImage: hasFallbackImage
        ? `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${dataSourceEmoji.image}`
        : undefined,
    }
  })

const gitHubCustomEmojiNames = [
  'atom',
  'basecamp',
  'basecampy',
  'bowtie',
  'electron',
  'feelsgood',
  'finnadie',
  'goberserk',
  'godmode',
  'hurtrealbad',
  'neckbeard',
  'octocat',
  'rage1',
  'rage2',
  'rage3',
  'rage4',
  'shipit',
  'suspect',
  'trollface',
]

const gitHubCustomEmojis: EmojiItem[] = gitHubCustomEmojiNames.map(name => {
  return {
    name,
    shortcodes: [name],
    tags: [],
    group: 'GitHub',
    fallbackImage: `https://github.githubassets.com/images/icons/emoji/${name}.png`,
  }
})

const content = `// This is a generated file

import { EmojiItem } from './emoji'

export const emojis: EmojiItem[] = ${json5.stringify(emojis, { space: 2 })}

export const gitHubCustomEmojis: EmojiItem[] = ${json5.stringify(gitHubCustomEmojis, { space: 2 })}

export const gitHubEmojis: EmojiItem[] = [...emojis, ...gitHubCustomEmojis]
`

fs.writeFileSync('./src/data.ts', content)
