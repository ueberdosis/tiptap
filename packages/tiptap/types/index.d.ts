import { Component } from 'vue'
import { Plugin } from 'prosemirror-state'
import { NodeSpec, Node as ProsemirrorNode } from "prosemirror-model";


export as namespace tiptap;

export const Editor: Component;

export declare class Extension {
    constructor(options: object)
    readonly options:object;
    readonly name: string | null;
    readonly type: string;
    readonly defaultOptions: object;
    readonly plugins:Array<Plugin>;

    inputRules(schema: ProsemirrorNode): Array<any>;
    keys(schema:ProsemirrorNode): {[key: string]: () => boolean};
}

export declare class Mark extends Extension {
    readonly view:NodeSpec;
    readonly schema:NodeSpec;
    command(schema: ProsemirrorNode): () => boolean
}

export declare class Node extends Extension {
    readonly view: NodeSpec | Component;
    readonly schema: NodeSpec;
    command(schema: ProsemirrorNode): () => boolean
}
