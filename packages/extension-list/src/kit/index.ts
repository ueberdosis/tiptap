import { Extension } from '@tiptap/core'

import { BulletList, BulletListOptions } from '../bullet-list/index.js'
import { ListItem, ListItemOptions } from '../item/index.js'
import { ListKeymap, ListKeymapOptions } from '../keymap/index.js'
import { OrderedList, OrderedListOptions } from '../ordered-list/index.js'
import { TaskItem, TaskItemOptions } from '../task-item/index.js'
import { TaskList, TaskListOptions } from '../task-list/index.js'

export interface ListKitOptions {
  /**
   * If set to false, the bulletList extension will not be registered
   * @example table: false
   */
  bulletList: Partial<BulletListOptions> | false
  /**
   * If set to false, the listItem extension will not be registered
   */
  listItem: Partial<ListItemOptions> | false
  /**
   * If set to false, the listKeymap extension will not be registered
   */
  listKeymap: Partial<ListKeymapOptions> | false
  /**
   * If set to false, the orderedList extension will not be registered
   */
  orderedList: Partial<OrderedListOptions> | false
  /**
   * If set to false, the taskItem extension will not be registered
   */
  taskItem: Partial<TaskItemOptions> | false
  /**
   * If set to false, the taskList extension will not be registered
   */
  taskList: Partial<TaskListOptions> | false
}

/**
 * The table kit is a collection of table editor extensions.
 *
 * It’s a good starting point for building your own table in Tiptap.
 */
export const ListKit = Extension.create<ListKitOptions>({
  name: 'listKit',

  addExtensions() {
    const extensions = []

    if (this.options.bulletList !== false) {
      extensions.push(BulletList.configure(this.options.bulletList))
    }

    if (this.options.listItem !== false) {
      extensions.push(ListItem.configure(this.options.listItem))
    }

    if (this.options.listKeymap !== false) {
      extensions.push(ListKeymap.configure(this.options.listKeymap))
    }

    if (this.options.orderedList !== false) {
      extensions.push(OrderedList.configure(this.options.orderedList))
    }

    if (this.options.taskItem !== false) {
      extensions.push(TaskItem.configure(this.options.taskItem))
    }

    if (this.options.taskList !== false) {
      extensions.push(TaskList.configure(this.options.taskList))
    }

    return extensions
  },
})
