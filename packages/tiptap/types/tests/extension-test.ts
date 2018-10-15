import { Extension, Mark, Node } from '../index'
import { Mark as ProsemirrorMark } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'


// Extension
class MyExtension extends Extension {
    constructor(options) {
        super(options)
    }

    get plugins () {
        return [new Plugin({})]
    }
}
new MyExtension({anyOption: true})


// Mark
class CustomMark extends Mark {}
new CustomMark({test: false}).command(new ProsemirrorMark())


// Node
class CustomNode extends Node {}
new CustomNode({}).command(new ProsemirrorMark())
