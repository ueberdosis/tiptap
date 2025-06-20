import dataSource from 'emoji-datasource/emoji.json'
import data from 'emojibase-data/en/data.json'
import messages from 'emojibase-data/en/messages.json'
import emojibaseShortcodes from 'emojibase-data/en/shortcodes/emojibase.json'
import gitHubShortcodes from 'emojibase-data/en/shortcodes/github.json'
import fs from 'fs'
import json5 from 'json5'

import { EmojiItem } from './emoji.js'
import { removeVariationSelector } from './helpers/removeVariationSelector.js'

const emojis: EmojiItem[] = data
  // .filter(emoji => emoji.version > 0 && emoji.version < 14)
  .map(emoji => {
    const dataSourceEmoji = dataSource.find(item => {
      return item.unified === emoji.hexcode || item.non_qualified === emoji.hexcode
    })
    const hasFallbackImage = dataSourceEmoji?.has_img_apple
    const name = [gitHubShortcodes[emoji.hexcode]].flat()[0]
      || [emojibaseShortcodes[emoji.hexcode]].flat()[0]
    const shortcodes = emojibaseShortcodes[emoji.hexcode]
      ? [emojibaseShortcodes[emoji.hexcode]].flat()
      : []
    const emoticons = emoji.emoticon
      ? [emoji.emoticon].flat()
      : []

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
