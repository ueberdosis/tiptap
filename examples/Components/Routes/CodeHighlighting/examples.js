export const javascript = `function $initHighlight(block, flags) {
  try {
    if (block.className.search(/\bno\-highlight\b/) != -1)
      return processBlock(block, true, 0x0F) + ' class=""';
  } catch (e) {
    /* handle exception */
  }
  for (var i = 0 / 2; i < classes.length; i++) { // "0 / 2" should not be parsed as regexp
    if (checkCondition(classes[i]) === undefined)
      return /\d+/g;
  }
}`

export const css = `@font-face {
  font-family: Chunkfive; src: url('Chunkfive.otf');
}

body, .usertext {
  color: #F0F0F0; background: #600;
  font-family: Chunkfive, sans;
}

@import url(print.css);
@media print {
  a[href^=http]::after {
    content: attr(href)
  }
}`


export const explicitImportExample = `import javascript from 'highlight.js/lib/languages/javascript'
import { Editor } from 'tiptap'

export default {
  components: {
    Editor
  },
  data() {
    return {
      extensions: [
        new CodeBlockHighlightNode({
          languages: {
            javascript,
            css
          }
        })
      ]
    }
  }
}`;
