import type { Node as ProsemirrorNode } from "@tiptap/pm/model";

export interface Result {
  message: string;
  from: number;
  to: number;
  // oxlint-disable-next-lineno-unsafe-function-type
  fix?: Function;
}

export default class LinterPlugin {
  protected doc;

  private results: Array<Result> = [];

  constructor(doc: ProsemirrorNode) {
    this.doc = doc;
  }

  // oxlint-disable-next-lineno-unsafe-function-type
  record(message: string, from: number, to: number, fix?: Function) {
    this.results.push({
      message,
      from,
      to,
      fix,
    });
  }

  scan() {
    return this;
  }

  getResults() {
    return this.results;
  }
}
