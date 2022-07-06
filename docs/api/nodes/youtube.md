---
description: Your favorite videos and jams - right in your editor!
icon: youtube-line
---

# YouTube
[![Version](https://img.shields.io/npm/v/@tiptap/extension-youtube.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-youtube)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-youtube.svg)](https://npmcharts.com/compare/@tiptap/extension-youtube?minimal=true)

This extension adds a new youtube embed node to the editor.

## Installation
```bash
npm install @tiptap/extension-youtube
```

## Settings

### inline
Controls if the node should be handled inline or as a block.

Default: `false`

```js
Youtube.configure({
  inline: false,
})
```

### width
Controls the default width of added videos

Default: `640`

```js
Youtube.configure({
  width: 480,
})
```

### height
Controls the default height of added videos

Default: `480`

```js
Youtube.configure({
  height: 320,
})
```

### controls
Enables or disables YouTube video controls

Default: `true`

```js
Youtube.configure({
  controls: false,
})
```

### nocookie
Enables the nocookie mode for YouTube embeds

Default: `false`

```js
Youtube.configure({
  nocookie: true,
})
```

### allowFullscreen
Allows the iframe to be played in fullscreen

Default: `true`

```js
Youtube.configure({
  allowFullscreen: false,
})
```


## Commands

### setYoutubeVideo(options)
Inserts a YouTube iframe embed at the current position

```js
editor.commands.setYoutubeVideo({
  src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  width: 640,
  height: 480,
})
```

#### Options

| Option           | Description                                                             | Optional |
| ---------------- | ----------------------------------------------------------------------- | -------- |
| src              | The url of the youtube video. Can be a YouTube or YouTube Music link    |          |
| width            | The embed width (overrides the default option, optional                 | ✅         |
| height           | The embed height (overrides the default option, optional                | ✅         |


## Source code
[packages/extension-youtube/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-youtube/)

## Usage
https://embed.tiptap.dev/preview/Nodes/YouTube
