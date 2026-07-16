import type { Editor } from './Editor.js'
import { type ExtendableConfig, Extendable } from './Extendable.js'
import type { CommandMap, InferredCommands, MergeCommandMaps } from './types.js'

// oxlint-disable-next-lineno-empty-object-type
export interface ExtensionConfig<Options = any, Storage = any> extends ExtendableConfig<
  Options,
  Storage,
  ExtensionConfig<Options, Storage>,
  null
> {}

/**
 * The Extension class is the base class for all extensions.
 * @see https://tiptap.dev/api/extensions#create-a-new-extension
 */
export class Extension<
  Options = any,
  Storage = any,
  Commands extends CommandMap = {},
> extends Extendable<Options, Storage, ExtensionConfig<Options, Storage>> {
  declare readonly __commands?: Commands

  type = 'extension'

  /**
   * Create a new Extension instance
   * @param config - Extension configuration object or a function that returns a configuration object
   */
  static create<Config extends Partial<ExtensionConfig>>(
    config: Config | (() => Config),
  ): Extension<any, any, InferredCommands<Config>>

  static create<O = any, S = any, Commands extends CommandMap = {}>(
    config?: Partial<ExtensionConfig<O, S>> | (() => Partial<ExtensionConfig<O, S>>),
  ): Extension<O, S, Commands>

  static create(config: Partial<ExtensionConfig> | (() => Partial<ExtensionConfig>) = {}) {
    // If the config is a function, execute it to get the configuration object
    const resolvedConfig = typeof config === 'function' ? config() : config
    return new Extension(resolvedConfig)
  }

  configure(options?: Partial<Options>) {
    return super.configure(options) as Extension<Options, Storage, Commands>
  }

  extend<
    ExtendedOptions = Options,
    ExtendedStorage = Storage,
    ExtendedConfig = ExtensionConfig<ExtendedOptions, ExtendedStorage>,
    ExtendedCommands extends CommandMap = MergeCommandMaps<
      Commands,
      InferredCommands<ExtendedConfig>
    >,
  >(
    extendedConfig?:
      | (() => Partial<ExtendedConfig>)
      | (Partial<ExtendedConfig> &
          ThisType<{
            name: string
            options: ExtendedOptions
            storage: ExtendedStorage
            editor: Editor
            type: null
          }>),
  ): Extension<ExtendedOptions, ExtendedStorage, ExtendedCommands> {
    // If the extended config is a function, execute it to get the configuration object
    const resolvedConfig = typeof extendedConfig === 'function' ? extendedConfig() : extendedConfig
    return super.extend(resolvedConfig) as Extension<
      ExtendedOptions,
      ExtendedStorage,
      ExtendedCommands
    >
  }
}
