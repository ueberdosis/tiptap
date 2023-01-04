---
description: Your favorite videos and jams - right in your editor!
icon: youtube-line
---

# YouTube
[![Version](https://img.shields.io/npm/v/@tiptap/extension-youtube.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-youtube)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-youtube.svg)](https://npmcharts.com/compare/@tiptap/extension-youtube?minimal=true)

This extension adds a new YouTube embed node to the editor.

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

### autoplay
Allows the iframe to to start playing after the player is loaded

Default: `false`

```js
Youtube.configure({
  autoplay: true,
})
```

### ccLanguage
Specifies the default language that the player will use to display closed captions. Set the parameter's value to an ISO 639-1 two-letter language code. For example, setting it to `es` will cause the captions to be in spanish

Default: `undefined`

```js
Youtube.configure({
  ccLanguage: 'es',
})
```

### ccLoadPolicy
Setting this parameter's value to `true` causes closed captions to be shown by default, even if the user has turned captions off

Default: `false`

```js
Youtube.configure({
  ccLoadPolicy: 'true',
})
```

### disableKBcontrols
Disables the keyboards controls for the iframe player

Default: `false`

```js
Youtube.configure({
  disableKBcontrols: 'true',
})
```

### enableIFrameApi
Enables the player to be controlled via IFrame Player API calls

Default: `false`

```js
Youtube.configure({
  enableIFrameApi: 'true',
})
```

### origin
This parameter provides an extra security measure for the IFrame API and is only supported for IFrame embeds. If you are using the IFrame API, which means you are setting the `enableIFrameApi` parameter value to `true`, you should always specify your domain as the `origin` parameter value.

Default: `''`

```js
Youtube.configure({
  origin: 'yourdomain.com',
})
```

### endTime
This parameter specifies the time, measured in seconds from the start of the video, when the player should stop playing the video.
For example, setting it to `15` will make the video stop at the 15 seconds mark

Default: `0`

```js
Youtube.configure({
  endTime: '15',
})
```

### interfaceLanguage
Sets the player's interface language. The parameter value is an ISO 639-1 two-letter language code. For example, setting it to `fr` will cause the interface to be in french

Default: `undefined`

```js
Youtube.configure({
  interfaceLanguage: 'fr',
})
```

### ivLoadPolicy
Setting this to 1 causes video annotations to be shown by default, whereas setting to 3 causes video annotations to not be shown by default

Default: `0`

```js
Youtube.configure({
  ivLoadPolicy: '3',
})
```

### loop
This parameter has limited support in IFrame embeds. To loop a single video, set the loop parameter value to `true` and set the playlist parameter value to the same video ID already specified in the Player API URL.

Default: `false`

```js
Youtube.configure({
  loop: 'true',
})
```

### playlist
This parameter specifies a comma-separated list of video IDs to play.

Default: `''`

```js
Youtube.configure({
  playlist: 'VIDEO_ID_1,VIDEO_ID_2,VIDEO_ID_3,...,VIDEO_ID_N',
})
```

### modestBranding
Disables the Youtube logo on the control bar of the player. Note that a small YouTube text label will still display in the upper-right corner of a paused video when the user's mouse pointer hovers over the player

Default: `false`

```js
Youtube.configure({
  modestBranding: 'true',
})
```

### progressBarColor
This parameter specifies the color that will be used in the player's video progress bar. Note that setting the color parameter to `white` will disable the `modestBranding` parameter

Default: `undefined`

```js
Youtube.configure({
  progressBarColor: 'white',
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
