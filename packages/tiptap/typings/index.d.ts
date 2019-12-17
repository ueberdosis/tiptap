import { Schema, NodeType, NodeSpec, MarkSpec, Node as ProsemirrorNode, MarkType, ParseOptions } from "prosemirror-model";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { Command, CommandFunction } from "../../tiptap-commands";
import { EditorView, EditorProps } from "prosemirror-view";
import { VueConstructor } from "vue";

export const EditorContent: VueConstructor;
export const EditorMenuBubble: VueConstructor;
export const EditorMenuBar: VueConstructor;
export type ExtensionOption = Extension | Node | Mark;

// there are some props available
// `node` is a Prosemirror Node Object
// `updateAttrs` is a function to update attributes defined in `schema`
// `view` is the ProseMirror view instance
// `options` is an array of your extension options
// `selected`
export interface NodeView {
    /** A Prosemirror Node Object */
    node?: ProsemirrorNode;
    /** A function to update attributes defined in `schema` */
    updateAttrs?: (attrs: { [key: string]: any }) => any;
    /** The ProseMirror view instance */
    view?: EditorView;
    /** An array of your extension options */
    options?: { [key: string]: any };
    /** Whether the node view is selected */
    selected?: boolean;
}

export type CommandGetter = ({ [key: string]: (() => Command) | Command }) | (() => Command) | Command | (() => Command)[];

export interface EditorUpdateEvent {
    state: EditorState;
    getHTML: () => string;
    getJSON: () => object;
    transaction: Transaction;
}

export interface EditorOptions {
    editorProps?: EditorProps,
    /** defaults to true */
    editable?: boolean,
    /** defaults to false */
    autoFocus?: boolean,
    extensions?: ExtensionOption[],
    content?: Object | string,
    emptyDocument?: {
        type: 'doc',
        content: [{
            type: 'paragraph',
        }],
    },
    /** defaults to false */
    useBuiltInExtensions?: boolean,
    /** defaults to false */
    disableInputRules?: boolean,
    /** defaults to false */
    disablePasteRules?: boolean,
    dropCursor?: {},
    parseOptions?: ParseOptions,
    /** defaults to true */
    injectCSS?: boolean,
    onInit?: ({ view, state }: { view: EditorView, state: EditorState }) => void,
    onTransaction?: (event: EditorUpdateEvent) => void,
    onUpdate?: (event: EditorUpdateEvent) => void,
    onFocus?: ({ event, state, view }: { event: FocusEvent, state: EditorState, view: EditorView }) => void,
    onBlur?: ({ event, state, view }: { event: FocusEvent, state: EditorState, view: EditorView }) => void,
    onPaste?: (...args) => void,
    onDrop?: (...args) => void,
}

export declare class Editor {
    commands: { [key: string]: Command };
    defaultOptions: { [key: string]: any };
    element: Element;
    extensions: Extension[];
    inputRules: any[];
    keymaps: any[];
    marks: Mark[];
    nodes: Node[];
    pasteRules: any[];
    plugins: Plugin[];
    schema: Schema;
    state: EditorState;
    view: EditorView;
    activeMarks: { [markName: string]: () => boolean };
    activeNodes: { [nodeName: string]: () => boolean };
    activeMarkAttrs: { [markName: string]: { [attr: string]: any } };


    /** 
     * Creates an [Editor] 
     * @param options - An object of Editor options.
     */
    constructor(options?: EditorOptions);

    /**
     * Replace the current content. You can pass an HTML string or a JSON document that matches the editor's schema.
     * @param content Defaults to {}.
     * @param emitUpdate Defaults to false.
     */
    setContent(content?: string | object, emitUpdate?: boolean);

    /**
     * Clears the current editor content.
     * 
     * @param emitUpdate Whether or not the change should trigger the onUpdate callback.
     */
    clearContent(emitUpdate?: boolean);

    /**
     * Overwrites the current editor options.
     * @param options Options an object of Editor options
     */
    setOptions(options: EditorOptions);

    /**
     * Register a ProseMirror plugin.
     * @param plugin 
     */
    registerPlugin(plugin: Plugin);

    /** Get the current content as JSON. */
    getJSON(): {}

    /** Get the current content as HTML. */
    getHTML(): string;

    /** Focus the editor */
    focus();

    /** Removes the focus from the editor. */
    blur();

    /** Destroy the editor and free all Prosemirror-related objects from memory.
     * You should always call this method on beforeDestroy() lifecycle hook of the Vue component wrapping the editor.
     */
    destroy();

    on(event: string, callbackFn: (params: any) => void);

    off(event: string, callbackFn: (params: any) => void);

    getMarkAttrs(markName: string): { [attributeName: string]: any };
}

export declare class Extension<Options = any> {
    constructor(options?: Options);
    /** Define a name for your extension */
    name?: string | null;
    /** Define some default options.The options are available as this.$options. */
    defaultOptions?: Options;
    /** Define a list of Prosemirror plugins. */
    plugins?: Plugin[];
    /** Define some keybindings. */
    keys?({ schema }: { schema: Schema | NodeSpec | MarkSpec }): { [keyCombo: string]: CommandFunction };
    /** Define commands. */
    commands?({ schema, attrs }: { schema: Schema | NodeSpec | MarkSpec, attrs: { [key: string]: string } }): CommandGetter;
    inputRules?({ schema }: { schema: Schema }): any[];
    pasteRules?({ schema }: { schema: Schema }): Plugin[];
    /** Called when options of extension are changed via editor.extensions.options */
    update?: (view: EditorView) => any;
    /** Options for that are either passed in from the extension constructor or set by defaultOptions() */
    options?: Options;
}

export declare class Node<V extends NodeView = any> extends Extension {
    schema?: NodeSpec;
    /** Reference to a view component constructor
     *  See https://stackoverflow.com/questions/38311672/generic-and-typeof-t-in-the-parameters
     */
    view?: { new(): V };
    commands?({ type, schema, attrs }: { type: NodeType, schema: NodeSpec, attrs: { [key: string]: string } }): CommandGetter;
    keys?({ type, schema }: { type: NodeType, schema: NodeSpec }): { [keyCombo: string]: CommandFunction };
    inputRules?({ type, schema }: { type: NodeType, schema: Schema }): any[];
    pasteRules?({ type, schema }: { type: NodeType, schema: Schema }): Plugin[];
}

export declare class Mark<V extends NodeView = any> extends Extension {
    schema?: MarkSpec;
    /** Reference to a view component constructor
     *  See https://stackoverflow.com/questions/38311672/generic-and-typeof-t-in-the-parameters
     */
    view?: { new(): V }
    commands?({ type, schema, attrs }: { type: MarkType, schema: MarkSpec, attrs: { [key: string]: string } }): CommandGetter;
    keys?({ type, schema }: { type: MarkType, schema: MarkSpec }): { [keyCombo: string]: CommandFunction };
    inputRules?({ type, schema }: { type: MarkType, schema: Schema }): any[];
    pasteRules?({ type, schema }: { type: MarkType, schema: Schema }): Plugin[];
}

export declare class Text extends Node { }
export declare class Paragraph extends Node { }
export declare class Doc extends Node { }

/** A set of commands registered to the editor. */
export interface EditorCommandSet { [key: string]: Command; }

/**
 * The properties passed into <editor-menu-bar /> component
 */
export declare interface MenuData {
    /** Whether the editor has focus. */
    focused: boolean;
    /** Function to focus the editor. */
    focus: () => void;
    /** A set of commands registered. */
    commands: EditorCommandSet;
    /** Check whether a node or mark is currently active. */
    isActive: IsActiveChecker;
    /** A function to get all mark attributes of the current selection.  */
    getMarkAttrs: (markName: string) => { [attributeName: string]: any };
}

export declare interface FloatingMenuData extends MenuData {
    /** An object for positioning the menu. */
    menu: MenuDisplayData;
}

/**
 * A data object passed to a menu bubble to help it determine its position
 * and visibility.
 */
export declare interface MenuDisplayData {
    /** Left position of the cursor. */
    left: number;
    /** Bottom position of the cursor. */
    bottom: number;
    /** Whether or not there is an active selection. */
    isActive: boolean;
}

/**
 * A map containing functions to check if a node/mark is currently selected.
 * The name of the node/mark is used as the key.
 */
export declare interface IsActiveChecker { [name: string]: () => boolean }
