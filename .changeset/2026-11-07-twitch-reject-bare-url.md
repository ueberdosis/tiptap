---
'@tiptap/extension-twitch': patch
---

`setTwitchVideo` and the paste rule now reject Twitch URLs without a video, clip or channel, such as `https://www.twitch.tv/`, instead of inserting an "Invalid Twitch URL" node.
