import { findChildren } from "@tiptap/core";
import { Plugin, Transaction, EditorState, PluginKey } from "prosemirror-state";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { Decoration, DecorationSet } from "prosemirror-view";

const RTL = "\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC";
const LTR =
  "A-Za-z\u00C0-\u00D6\u00D8-\u00F6" +
  "\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C" +
  "\uFE00-\uFE6F\uFEFD-\uFFFF";

export const RTL_REGEX = new RegExp("^[^" + LTR + "]*[" + RTL + "]");
export const LTR_REGEX = new RegExp("^[^" + RTL + "]*[" + LTR + "]");

export function getTextDirection(text: string): "ltr" | "rtl" | null {
  if (RTL_REGEX.test(text)) {
    return "rtl";
  }
  if (LTR_REGEX.test(text)) {
    return "ltr";
  }
  return null;
}

function getDecorations({ doc, types }: { doc: ProsemirrorNode; types: string[] }) {
  const decorations: Decoration[] = [];

  findChildren(doc, (node) => types.includes(node.type.name)).forEach((block) => {
    const from = block.pos;
    const to = from + block.node.nodeSize;
    const direction = getTextDirection(block.node.textContent);

    const decoration = Decoration.node(from, to, {
      dir: direction,
    });

    decorations.push(decoration);
  });

  return DecorationSet.create(doc, decorations);
}

export function DirectionPlugin({ types }: { types: string[] }) {
  return new Plugin({
    key: new PluginKey("textDirection"),
    state: {
      init(_, { doc }) {
        return getDecorations({
          doc,
          types,
        });
      },
      apply(
        transaction: Transaction,
        decorationSet: any,
        oldState: EditorState,
        newState: EditorState
      ) {
        if (transaction.docChanged) {
          return getDecorations({
            doc: transaction.doc,
            types,
          });
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
}
