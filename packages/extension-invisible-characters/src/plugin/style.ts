export const style = `.Tiptap-invisible-character {
  height: 0;
  padding: 0;
  pointer-events: none;
  user-select: none;
  width: 0;
}

.Tiptap-invisible-character::before {
  caret-color: inherit;
  color: #aaa;
  display: inline-block;
  font-style: normal;
  font-weight: 400;
  line-height: 1em;
  width: 0;
}

.Tiptap-invisible-character--space::before {
  content: '·'
}

.Tiptap-invisible-character--break::before {
  content: '¬'
}

.Tiptap-invisible-character--paragraph::before {
  content: '¶'
}

.Tiptap-invisible-character + img.ProseMirror-separator {
  height: 0 !important;
  pointer-events: none;
  user-select: none;
  width: 0 !important;
}

.is-empty[data-placeholder].has-focus > .Tiptap-invisible-character {
  display: none;
}
`

export default style
