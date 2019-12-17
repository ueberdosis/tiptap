
import { Extension, Node, Mark } from "../../tiptap";
import { NodeSpec } from "prosemirror-model";

export interface PlaceholderOptions {
    emptyNodeClass?: string,
    emptyNodeText?: string,
    showOnlyWhenEditable?: boolean,
    showOnlyCurrent?: boolean,
}
export declare class Placeholder extends Extension {
    constructor(options?: PlaceholderOptions);
}

export interface TrailingNodeOptions {
    /**
     * Node to be at the end of the document
     * 
     * defaults to 'paragraph'
     */
    node: string;
    /**
     * The trailing node will not be displayed after these specified nodes.
     */
    notAfter: string[];
}
export declare class TrailingNode extends Extension {
    constructor(options?: TrailingNodeOptions);
}

export interface HeadingOptions {
    levels?: number[],
}

export declare class History extends Extension { }
export declare class Underline extends Mark { }
export declare class Strike extends Mark { }
export declare class Italic extends Mark { }
export declare class Bold extends Mark { }
export declare class BulletList extends Node { }
export declare class ListItem extends Node { }
export declare class OrderedList extends Node { }
export declare class HardBreak extends Node { }
export declare class Blockquote extends Node { }
export declare class CodeBlock extends Node { }
export declare class TodoItem extends Node { }
export declare class TodoList extends Node { }


export declare class Heading extends Node {
    constructor(options?: HeadingOptions);
}

export declare class Table extends Node { }
export declare class TableCell extends Node { }
export declare class TableRow extends Node { }
export declare class TableHeader extends Node { }