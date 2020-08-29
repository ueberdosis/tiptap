// Type definitions for tiptap 1.29.4
// Project: https://github.com/ueberdosis/tiptap

/// <reference types="vue" />
/// <reference types="prosemirror-state" />
/// <reference types="prosemirror-view" />
/// <reference types="prosemirror-model" />
/// <reference types="prosemirror-schema-basic" />
/// <reference types="prosemirror-schema-basic" />
/// <reference types="prosemirror-dropcursor" />
/// <reference types="prosemirror-inputrules" />

declare module tiptap {

    import Vue                                                from 'vue';
    import { Plugin, EditorState }                            from "@types/prosemirror-state";
    import { EditorProps }                                    from "@types/prosemirror-view";
    import { ProsemirrorNode, ProsemirrorMark, ParseOptions } from "@types/prosemirror-model"
    import { Schema }                                         from "@types/prosemirror-schema-basic";
    import DropCursor                                         from "@types/prosemirror-dropcursor";
    import { InputRule }                                      from "@types/prosemirror-inputrules";

    export interface EditorConfig {
        content?              : string | EditorState | null,
        editorProps?          : EditorProps,
        editable?             : boolean,
        autoFocus?            : boolean,
        extensions?           : Node[] | Mark[] | Plugin[],
        useBuiltInExtensions? : boolean,
        topNode?              : string,
        emptyDocument?        : EmptyDocument,
        disableInputRules?    : boolean,
        disablePasteRules?    : boolean,
        dropCursor?           : DropCursor,
        enableDropCursor?     : boolean,
        enableGapCursor?      : boolean,
        parseOptions?         : ParseOptions,
        onInit?               : Function,
        onTransaction?        : Function,
        onUpdate?             : Function,
        onFocus?              : Function,
        onBlur?               : Function,
        onPaste?              : Function,
        onDrop?               : Function,
    }

    export interface EditorMenuBarProps {
        commands?     : Function[],
        isActive?     : Object,
        getMarkAttrs? : Function,
        getNodeAttrs? : Function,
        focused?      : boolean,
        focus?        : Function,
    }

    export interface EditorMenuBubbleProps extends EditorMenuBarProps{
        menu? : Object
    }

    export interface EditorFloatingMenuProps extends EditorMenuBubbleProps {}

    export type HandlePlugins = (plugin : Plugin, oldPlugins : Plugin[]) => void;

    export class Editor {
        public constructor(EditorConfig? : EditorConfig);

        public setContent(content: string, emitUpdate : boolean = false, parseOptions? : ParseOptions) : void;
        public clearContent(emitUpdate : boolean = false);
        public setOptions(EditorConfig) : void;
        public registerPlugin(plugin : Plugin | Function | null = null, handlePlugins? : HandlePlugins) : void;

        public getHTML() : string;
        public getJSON() : string;
        public focus()   : void;
        public blur()    : void;
        public destroy() : void;
    }

    export class EditorMenuBar extends Vue {}
    export class EditorMenuBubble extends Vue {}
    export class EditorFloatingMenu extends Vue {}

    export class EditorContent extends Vue {}

    export class Extension {
        public constructor(options : Object);
        public keys({ schema : Schema }) : Object | null;
        public commands?({ schema : Schema, attrs : any }) : Object | null;
        public inputRules({ schema : Schema }) : InputRule[];
        public pasteRules({ schema : Schema }) : Object[] ;    // @ToDo: Resolve output type

        get name() : string | null;
        get defaultOptions() : Object;
        get plugins() : Plugin[];
        get update() : Function | undefined;
    }

    interface TiptapNodeMark {
        keys({ type, schema : Schema }) : Object | null;
        commands({ type, schema : Schema, attrs : Object }) : Object | null;
        inputRules({ type, schema : Schema}) : InputRule[];
        pasteRules({ type, scheme: Schema }) : Object[];

        name() : string | null;
        defaultOptions() : Object;
        schema() : Schema;
        view() : Vue;
        plugins() : Plugin[];
    }

    export class Node extends ProsemirrorNode implements TiptapNodeMark {
        keys({ type, schema: Schema }: { type: any; schema: any; }): Object;
        commands({ type, schema: Schema, attrs: Object }: { type: any; schema: any; attrs: any; }): Object;
        inputRules({ type, schema: Schema }: { type: any; schema: any; }): any[];
        pasteRules({ type, scheme: Schema }: { type: any; scheme: any; }): Object[];
        name(): string;
        defaultOptions(): Object;
        schema();
        view();
        plugins(): any[];
    }
    export class Mark extends ProsemirrorMark implements TiptapNodeMark {
        keys({ type, schema: Schema }: { type: any; schema: any; }): Object;
        commands({ type, schema: Schema, attrs: Object }: { type: any; schema: any; attrs: any; }): Object;
        inputRules({ type, schema: Schema }: { type: any; schema: any; }): any[];
        pasteRules({ type, scheme: Schema }: { type: any; scheme: any; }): Object[];
        name(): string;
        defaultOptions(): Object;
        schema();
        view();
        plugins(): any[];
    }
}

export = tiptap;
