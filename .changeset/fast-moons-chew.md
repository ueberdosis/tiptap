---
'@tiptap/extension-link': patch
---

Fixed an issue where clicking on non-link elements (like images) required multiple clicks to select them. The link click handler now properly returns early when the clicked element is not a link, allowing other node handlers to process the click event.
