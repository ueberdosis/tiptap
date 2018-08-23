import {
	chainCommands,
	deleteSelection,
	joinBackward,
	selectNodeBackward,
	joinForward,
	selectNodeForward,
	joinUp,
	joinDown,
	lift,
	newlineInCode,
	exitCode,
	createParagraphNear,
	liftEmptyBlock,
	splitBlock,
	splitBlockKeepMarks,
	selectParentNode,
	selectAll,
	wrapIn,
	setBlockType,
	toggleMark,
	autoJoin,
	baseKeymap,
	pcBaseKeymap,
	macBaseKeymap,
} from 'prosemirror-commands'

import {
	addListNodes,
	wrapInList,
	splitListItem,
	liftListItem,
	sinkListItem,
} from 'prosemirror-schema-list'

import {
	wrappingInputRule,
	textblockTypeInputRule,
} from 'prosemirror-inputrules'

import removeMark from './commands/removeMark'
import toggleBlockType from './commands/toggleBlockType'
import toggleList from './commands/toggleList'
import updateMark from './commands/updateMark'

export {
	// prosemirror-commands
	chainCommands,
	deleteSelection,
	joinBackward,
	selectNodeBackward,
	joinForward,
	selectNodeForward,
	joinUp,
	joinDown,
	lift,
	newlineInCode,
	exitCode,
	createParagraphNear,
	liftEmptyBlock,
	splitBlock,
	splitBlockKeepMarks,
	selectParentNode,
	selectAll,
	wrapIn,
	setBlockType,
	toggleMark,
	autoJoin,
	baseKeymap,
	pcBaseKeymap,
	macBaseKeymap,

	// prosemirror-schema-list
	addListNodes,
	wrapInList,
	splitListItem,
	liftListItem,
	sinkListItem,

	// prosemirror-inputrules
	wrappingInputRule,
	textblockTypeInputRule,

	// custom
	removeMark,
	toggleBlockType,
	toggleList,
	updateMark,
}
