import { Node } from 'prosemirror-model'
import { DecorationSet } from 'prosemirror-view'

export interface InvisiblesOptions {
  spaces: boolean;
  hardBreaks: boolean;
  paragraph: boolean;
}

export interface Position {
  pos: number;
  text: string;
}

export type BuilderFn = () => (from: number, to: number, doc: Node, decos: DecorationSet) => DecorationSet
