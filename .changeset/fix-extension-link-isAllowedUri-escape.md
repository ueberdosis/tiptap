---
"@tiptap/extension-link": patch
---

Fix `isAllowedUri` accepting unknown protocols whose name contains a hyphen (e.g. `unknown-protocol://test`). The hyphen is a valid scheme character per RFC 3986, but the regex was built from a template literal where `\-` collapsed to `-`, leaving the terminator class `[^a-z+.-:]` to parse `.-:` as a character range that excluded `0-9` and `/` rather than `-`. With the proper double-escape, the regex correctly excludes `-` and unknown hyphenated schemes are rejected again.
