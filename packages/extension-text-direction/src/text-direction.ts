import { Extension } from "@tiptap/core";
import { DirectionPlugin } from "./text-direction-plugin";

export interface TextDirectionOptions {
  types: string[];
  directions: string[];
  defaultDirection: "rtl" | "ltr" | null;
}

export const TextDirection = Extension.create<TextDirectionOptions>({
  name: "textDirection",

  addOptions() {
    return {
      types: [],
      directions: ["ltr", "rtl"],
      defaultDirection: null,
    };
  },

  addProseMirrorPlugins() {
    return [DirectionPlugin({ types: this.options.types })];
  },
});
