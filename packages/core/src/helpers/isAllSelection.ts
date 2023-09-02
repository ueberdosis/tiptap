import {AllSelection} from '@tiptap/pm/state';

export function isAllSelection(value: unknown): value is AllSelection {
    return value instanceof AllSelection;
}
