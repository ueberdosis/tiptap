import { MarkType } from "@tiptap/pm/model";

import { getMarksBetween } from "../helpers/getMarksBetween.js";
import { InputRule, InputRuleFinder } from "../InputRule.js";
import { ExtendedRegExpMatchArray } from "../types.js";
import { callOrReturn } from "../utilities/callOrReturn.js";

/**
 * Build an input rule that adds a mark when the
 * matched text is typed into it.
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#input-rules
 */
export function markInputRule(config: {
  find: InputRuleFinder;
  type: MarkType;
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null;
}) {
  return new InputRule({
    find: config.find,
    handler: ({ state, range, match }) => {
      const attributes = callOrReturn(config.getAttributes, undefined, match);

      if (attributes === false || attributes === null) {
        return null;
      }

      const { tr } = state;
      const captureGroup = match[match.length - 1];
      const fullMatch = match[0];

      if (captureGroup) {
        const startSpaces = fullMatch.search(/\S/);
        const textStart = range.from + fullMatch.indexOf(captureGroup);
        const textEnd = textStart + captureGroup.length;
        const excludedMarks = getMarksBetween(range.from, range.to, state.doc)
          .filter((item) => {
            // @ts-ignore
            const excluded = item.mark.type.excluded as MarkType[];

            return excluded.find((type) => type === config.type && type !== item.mark.type);
          })
          .filter((item) => item.to > textStart);

        if (excludedMarks.length) {
          return null;
        }
        if (textEnd < range.to && !config.type.name === "code") {
          tr.delete(textEnd, range.to);
        }

        if (textStart > range.from && !config.type.name === "code") {
          tr.delete(range.from + startSpaces, textStart);
        }
        if (config.type.name === "code") {

          /* Adjusting the range to handle cases with no spaces before the code
             Example: `123` - if there are no spaces before the code, the range starts from 123`
             When there are spaces, it starts from `123` */
          const start = range.from - (startSpaces ? 0 : 1);
          const end = range.to - 1;
          tr.delete(end, range.to);
          tr.delete(start, start + 1);
          tr.addMark(start, end, config.type.create(attributes || {}));
        }
        if (!config.type.name === "code") {
          const markEnd = range.from + startSpaces + captureGroup.length;
          tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}));
        }
        tr.removeStoredMark(config.type);
      }
    },
  });
}