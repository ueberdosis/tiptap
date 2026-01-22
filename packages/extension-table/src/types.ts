import type { ParentConfig } from '@dibdab/core'

declare module '@dibdab/core' {
  interface NodeConfig<Options, Storage> {
    /**
     * A string or function to determine the role of the table.
     * @default 'table'
     * @example () => 'table'
     */
    tableRole?:
      | string
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options>>['tableRole']
        }) => string)
  }
}
