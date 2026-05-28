---
"@tiptap/extension-collaboration-caret": patch
---

Fix memory leak when destroying an editor while the collaboration provider stays alive (e.g. multiple editors sharing one provider). The extension's awareness `update` listener is now removed on destroy, so the editor can be garbage collected.
