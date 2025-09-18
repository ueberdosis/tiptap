export const sidebarConfig = {
  id: 'editor',
  rootHref: '/editor/getting-started/overview',
  title: 'Editor',
  items: [
    {
      type: 'group',
      href: '/editor/getting-started',
      title: 'Get started',
      children: [
        {
          title: 'Overview',
          href: '/editor/getting-started/overview',
        },
        {
          title: 'Install',
          href: '/editor/getting-started/install',
          children: [
            {
              href: '/editor/getting-started/install/vanilla-javascript',
              title: 'Vanilla JavaScript',
            },
            {
              href: '/editor/getting-started/install/react',
              title: 'React',
            },
            {
              href: '/editor/getting-started/install/nextjs',
              title: 'Next.js',
            },
            {
              href: '/editor/getting-started/install/vue3',
              title: 'Vue 3',
            },
            {
              href: '/editor/getting-started/install/vue2',
              title: 'Vue 2',
            },
            {
              href: '/editor/getting-started/install/nuxt',
              title: 'Nuxt',
            },
            {
              href: '/editor/getting-started/install/svelte',
              title: 'Svelte',
            },
            {
              href: '/editor/getting-started/install/alpine',
              title: 'Alpine',
            },
            {
              href: '/editor/getting-started/install/php',
              title: 'PHP',
            },
            {
              href: '/editor/getting-started/install/cdn',
              title: 'CDN',
            },
          ],
        },
        {
          title: 'Configure',
          href: '/editor/getting-started/configure',
        },
        {
          title: 'Styling',
          href: '/editor/getting-started/style-editor',
          children: [
            {
              href: '/editor/getting-started/style-editor/custom-menus',
              title: 'Custom menus',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      title: 'Extensions',
      href: '/editor/extensions',
      children: [
        {
          href: '/editor/extensions/overview',
          title: 'Overview',
        },
        {
          href: '/editor/extensions/nodes',
          title: 'Nodes',
          children: [
            {
              href: '/editor/extensions/nodes/blockquote',
              title: 'Blockquote',
            },
            {
              href: '/editor/extensions/nodes/bullet-list',
              title: 'Bullet list',
            },
            {
              href: '/editor/extensions/nodes/code-block',
              title: 'Code block',
            },
            {
              href: '/editor/extensions/nodes/code-block-lowlight',
              title: 'Code block lowlight',
            },
            {
              href: '/editor/extensions/nodes/details',
              title: 'Details',
            },
            {
              href: '/editor/extensions/nodes/details-content',
              title: 'Details content',
            },
            {
              href: '/editor/extensions/nodes/details-summary',
              title: 'Details summary',
            },
            {
              href: '/editor/extensions/nodes/document',
              title: 'Document',
            },
            {
              href: '/editor/extensions/nodes/emoji',
              title: 'Emoji',
            },
            {
              href: '/editor/extensions/nodes/hard-break',
              title: 'Hard break',
            },
            {
              href: '/editor/extensions/nodes/heading',
              title: 'Heading',
            },
            {
              href: '/editor/extensions/nodes/horizontal-rule',
              title: 'Horizontal rule',
            },
            {
              href: '/editor/extensions/nodes/image',
              title: 'Image',
            },
            {
              href: '/editor/extensions/nodes/list-item',
              title: 'List item',
            },
            {
              href: '/editor/extensions/nodes/mathematics',
              title: 'Mathematics',
            },
            {
              href: '/editor/extensions/nodes/mention',
              title: 'Mention',
            },
            {
              href: '/editor/extensions/nodes/ordered-list',
              title: 'Ordered list',
            },
            {
              href: '/editor/extensions/nodes/paragraph',
              title: 'Paragraph',
            },
            {
              href: '/editor/extensions/nodes/table',
              title: 'Table',
            },
            {
              href: '/editor/extensions/nodes/table-cell',
              title: 'Table cell',
            },
            {
              href: '/editor/extensions/nodes/table-header',
              title: 'Table header',
            },
            {
              href: '/editor/extensions/nodes/table-row',
              title: 'Table row',
            },
            {
              href: '/editor/extensions/nodes/task-list',
              title: 'Task list',
            },
            {
              href: '/editor/extensions/nodes/task-item',
              title: 'Task item',
            },
            {
              href: '/editor/extensions/nodes/text',
              title: 'Text',
            },
            {
              href: '/editor/extensions/nodes/youtube',
              title: 'Youtube',
            },
          ],
        },
        {
          href: '/editor/extensions/marks',
          title: 'Marks',
          children: [
            {
              href: '/editor/extensions/marks/bold',
              title: 'Bold',
            },
            {
              href: '/editor/extensions/marks/code',
              title: 'Code',
            },
            {
              href: '/editor/extensions/marks/highlight',
              title: 'Highlight',
            },
            {
              href: '/editor/extensions/marks/italic',
              title: 'Italic',
            },
            {
              href: '/editor/extensions/marks/link',
              title: 'Link',
            },
            {
              href: '/editor/extensions/marks/strike',
              title: 'Strike',
            },
            {
              href: '/editor/extensions/marks/subscript',
              title: 'Subscript',
            },
            {
              href: '/editor/extensions/marks/superscript',
              title: 'Superscript',
            },
            {
              href: '/editor/extensions/marks/text-style',
              title: 'Text Style',
            },
            {
              href: '/editor/extensions/marks/underline',
              title: 'Underline',
            },
          ],
        },
        {
          href: '/editor/extensions/functionality',
          title: 'Functionality',
          children: [
            {
              href: '/editor/extensions/functionality/ai-agent',
              title: 'AI Agent',
              tags: ['Team'],
              beta: true,
            },
            {
              href: '/editor/extensions/functionality/ai-changes',
              title: 'AI Changes',
              tags: ['Team'],
              beta: true,
            },
            {
              href: '/editor/extensions/functionality/ai-generation',
              title: 'AI Generation',
              tags: ['Start'],
            },
            {
              href: '/editor/extensions/functionality/ai-suggestion',
              title: 'AI Suggestion',
              tags: ['Team'],
              beta: true,
            },
            {
              href: '/editor/extensions/functionality/bubble-menu',
              title: 'Bubble menu',
            },
            {
              href: '/editor/extensions/functionality/character-count',
              title: 'Character count',
            },
            {
              href: '/editor/extensions/functionality/collaboration',
              title: 'Collaboration',
            },
            {
              href: '/editor/extensions/functionality/collaboration-caret',
              title: 'Collaboration Caret',
            },
            {
              href: '/editor/extensions/functionality/background-color',
              title: 'Background Color',
            },
            {
              href: '/editor/extensions/functionality/color',
              title: 'Color',
            },
            {
              href: '/editor/extensions/functionality/comments',
              title: 'Comments',
              tags: ['Start'],
              beta: true,
            },
            {
              href: '/editor/extensions/functionality/drag-handle',
              title: 'Drag Handle',
            },
            {
              href: '/editor/extensions/functionality/drag-handle-react',
              title: 'Drag Handle React',
            },
            {
              href: '/editor/extensions/functionality/drag-handle-vue',
              title: 'Drag Handle Vue',
            },
            {
              href: '/editor/extensions/functionality/dropcursor',
              title: 'Dropcursor',
            },
            {
              href: '/editor/extensions/functionality/export',
              title: 'Export',
              tags: ['Start'],
              beta: true,
            },
            {
              href: '/editor/extensions/functionality/filehandler',
              title: 'File handler',
            },
            {
              href: '/editor/extensions/functionality/floatingmenu',
              title: 'Floating menu',
            },
            {
              href: '/editor/extensions/functionality/focus',
              title: 'Focus',
            },
            {
              href: '/editor/extensions/functionality/fontfamily',
              title: 'Font family',
            },
            {
              href: '/editor/extensions/functionality/fontsize',
              title: 'Font size',
            },
            {
              href: '/editor/extensions/functionality/gapcursor',
              title: 'Gap cursor',
            },
            {
              href: '/editor/extensions/functionality/invisiblecharacters',
              title: 'Invisible characters',
            },
            {
              href: '/editor/extensions/functionality/line-height',
              title: 'Line Height',
            },
            {
              href: '/editor/extensions/functionality/list-kit',
              title: 'List kit',
            },
            {
              href: '/editor/extensions/functionality/listkeymap',
              title: 'List Keymap',
            },
            {
              href: '/editor/extensions/functionality/import',
              title: 'Import',
              tags: ['Start'],
              beta: true,
            },
            {
              href: '/editor/extensions/functionality/placeholder',
              title: 'Placeholder',
            },
            {
              href: '/editor/extensions/functionality/snapshot',
              title: 'Version',
              tags: ['Starter'],
            },
            {
              href: '/editor/extensions/functionality/snapshot-compare',
              title: 'Version Compare',
              tags: ['Team'],
            },
            {
              href: '/editor/extensions/functionality/selection',
              title: 'Selection',
            },
            {
              href: '/editor/extensions/functionality/starterkit',
              title: 'Starter kit',
            },
            {
              href: '/editor/extensions/functionality/table-kit',
              title: 'Table kit',
            },
            {
              href: '/editor/extensions/functionality/table-of-contents',
              title: 'Table of contents',
            },
            {
              href: '/editor/extensions/functionality/text-style-kit',
              title: 'TextStyle kit',
            },
            {
              href: '/editor/extensions/functionality/textalign',
              title: 'Text align',
            },
            {
              href: '/editor/extensions/functionality/trailing-node',
              title: 'Trailing node',
            },
            {
              href: '/editor/extensions/functionality/typography',
              title: 'Typography',
            },
            {
              href: '/editor/extensions/functionality/undo-redo',
              title: 'Undo & Redo History',
            },
            {
              href: '/editor/extensions/functionality/uniqueid',
              title: 'Unique ID',
            },
          ],
        },
        {
          href: '/editor/extensions/custom-extensions',
          title: 'Custom extensions',
          children: [
            {
              href: '/editor/extensions/custom-extensions/create-new',
              title: 'Create new',
              children: [
                {
                  href: '/editor/extensions/custom-extensions/create-new/extension',
                  title: 'Extension API',
                },
                {
                  href: '/editor/extensions/custom-extensions/create-new/node',
                  title: 'Node API',
                },
                {
                  href: '/editor/extensions/custom-extensions/create-new/mark',
                  title: 'Mark API',
                },
              ],
            },
            {
              href: '/editor/extensions/custom-extensions/extend-existing',
              title: 'Extend existing',
            },
            {
              href: '/editor/extensions/custom-extensions/node-views',
              title: 'Node views',
              children: [
                {
                  href: '/editor/extensions/custom-extensions/node-views/javascript',
                  title: 'Javascript',
                },
                {
                  href: '/editor/extensions/custom-extensions/node-views/react',
                  title: 'React',
                },
                {
                  href: '/editor/extensions/custom-extensions/node-views/vue',
                  title: 'Vue',
                },
                {
                  href: '/editor/extensions/custom-extensions/node-views/examples',
                  title: 'Examples',
                },
              ],
            },
            {
              href: '/editor/extensions/custom-extensions/mark-views',
              title: 'Mark views',
              children: [
                {
                  href: '/editor/extensions/custom-extensions/mark-views/javascript',
                  title: 'Javascript',
                },
                {
                  href: '/editor/extensions/custom-extensions/mark-views/react',
                  title: 'React',
                },
                {
                  href: '/editor/extensions/custom-extensions/mark-views/vue',
                  title: 'Vue',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      title: 'Core Concepts',
      href: '/editor/core-concepts',
      children: [
        {
          href: '/editor/core-concepts/introduction',
          title: 'Introduction',
        },
        {
          href: '/editor/core-concepts/extensions',
          title: 'Extensions',
        },
        {
          href: '/editor/core-concepts/nodes-and-marks',
          title: 'Nodes and Marks',
        },
        {
          href: '/editor/core-concepts/schema',
          title: 'Schema',
        },
        {
          href: '/editor/core-concepts/keyboard-shortcuts',
          title: 'Keyboard shortcuts',
        },
        {
          title: 'Persistence',
          href: '/editor/core-concepts/persistence',
        },
        {
          title: 'ProseMirror',
          href: '/editor/core-concepts/prosemirror',
        },
      ],
    },
    {
      type: 'group',
      href: '/editor/api',
      title: 'API',
      children: [
        {
          href: '/editor/api/editor',
          title: 'Editor instance',
        },
        {
          href: '/editor/api/commands',
          title: 'Commands',
          children: [
            {
              href: '/editor/api/commands/content',
              title: 'Content',
              children: [
                {
                  href: '/editor/api/commands/content/clear-content',
                  title: 'clearContent',
                },
                {
                  href: '/editor/api/commands/content/cut',
                  title: 'cut',
                },
                {
                  href: '/editor/api/commands/content/insert-content',
                  title: 'insertContent',
                },
                {
                  href: '/editor/api/commands/content/insert-content-at',
                  title: 'insertContentAt',
                },
                {
                  href: '/editor/api/commands/content/set-content',
                  title: 'setContent',
                },
              ],
            },
            {
              href: '/editor/api/commands/nodes-and-marks',
              title: 'Nodes & Marks',
              children: [
                {
                  href: '/editor/api/commands/nodes-and-marks/clear-nodes',
                  title: 'clearNodes',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/create-paragraph-near',
                  title: 'createParagraphNear',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/delete-node',
                  title: 'deleteNode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/extend-mark-range',
                  title: 'extendMarkRange',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/exit-code',
                  title: 'exitCode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-backward',
                  title: 'joinBackward',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-down',
                  title: 'joinDown',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-forward',
                  title: 'joinForward',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-textblock-backward',
                  title: 'joinTextblockBackward',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-textblock-forward',
                  title: 'joinTextblockForward',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-up',
                  title: 'joinUp',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/lift',
                  title: 'lift',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/lift-empty-block',
                  title: 'liftEmptyBlock',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/newline-in-code',
                  title: 'newlineInCode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/reset-attributes',
                  title: 'resetAttributes',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/set-mark',
                  title: 'setMark',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/set-node',
                  title: 'setNode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/split-block',
                  title: 'splitBlock',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/toggle-mark',
                  title: 'toggleMark',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/toggle-node',
                  title: 'toggleNode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/toggle-wrap',
                  title: 'toggleWrap',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/undo-input-rule',
                  title: 'undoInputRule',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/unset-all-marks',
                  title: 'unsetAllMarks',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/unset-mark',
                  title: 'unsetMark',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/update-attributes',
                  title: 'updateAttributes',
                },
              ],
            },
            {
              href: '/editor/api/commands/lists',
              title: 'Lists',
              children: [
                {
                  href: '/editor/api/commands/lists/lift-list-item',
                  title: 'liftListItem',
                },
                {
                  href: '/editor/api/commands/lists/sink-list-item',
                  title: 'sinkListItem',
                },
                {
                  href: '/editor/api/commands/lists/split-list-item',
                  title: 'splitListItem',
                },
                {
                  href: '/editor/api/commands/lists/toggle-list',
                  title: 'toggleList',
                },
                {
                  href: '/editor/api/commands/lists/wrap-in-list',
                  title: 'wrapInList',
                },
              ],
            },
            {
              href: '/editor/api/commands/selection',
              title: 'Selection',
              children: [
                {
                  href: '/editor/api/commands/selection/blur',
                  title: 'blur',
                },
                {
                  href: '/editor/api/commands/selection/delete-range',
                  title: 'deleteRange',
                },
                {
                  href: '/editor/api/commands/selection/delete-selection',
                  title: 'deleteSelection',
                },
                {
                  href: '/editor/api/commands/selection/enter',
                  title: 'enter',
                },
                {
                  href: '/editor/api/commands/selection/focus',
                  title: 'focus',
                },
                {
                  href: '/editor/api/commands/selection/keyboard-shortcut',
                  title: 'keyboardShortcut',
                },
                {
                  href: '/editor/api/commands/selection/scroll-into-view',
                  title: 'scrollIntoView',
                },
                {
                  href: '/editor/api/commands/selection/select-all',
                  title: 'selectAll',
                },
                {
                  href: '/editor/api/commands/selection/select-node-backward',
                  title: 'selectNodeBackward',
                },
                {
                  href: '/editor/api/commands/selection/select-node-forward',
                  title: 'selectNodeForward',
                },
                {
                  href: '/editor/api/commands/selection/select-parent-node',
                  title: 'selectParentNode',
                },
                {
                  href: '/editor/api/commands/selection/set-node-selection',
                  title: 'setNodeSelection',
                },
                {
                  href: '/editor/api/commands/selection/set-text-selection',
                  title: 'setTextSelection',
                },
              ],
            },
            {
              href: '/editor/api/commands/for-each',
              title: 'forEach',
            },
            {
              href: '/editor/api/commands/select-textblock-end',
              title: 'selectTextblockEnd',
            },
            {
              href: '/editor/api/commands/select-textblock-start',
              title: 'selectTextblockStart',
            },
            {
              href: '/editor/api/commands/set-meta',
              title: 'setMeta',
            },
          ],
        },
        {
          href: '/editor/api/utilities',
          title: 'Utilities',
          children: [
            {
              href: '/editor/api/utilities/html',
              title: 'HTML',
            },
            {
              href: '/editor/api/utilities/static-renderer',
              title: 'Static Renderer',
            },
            {
              href: '/editor/api/utilities/jsx',
              title: 'JSX',
            },
            {
              href: '/editor/api/utilities/suggestion',
              title: 'Suggestion',
            },
            {
              href: '/editor/api/utilities/tiptap-for-php',
              title: 'Tiptap for PHP',
            },
          ],
        },
        {
          href: '/editor/api/node-positions',
          title: 'Node Positions',
        },
        {
          href: '/editor/api/events',
          title: 'Events',
        },
        {
          href: '/editor/api/input-rules',
          title: 'Input Rules',
        },
        {
          href: '/editor/api/paste-rules',
          title: 'Paste Rules',
        },
      ],
    },
    {
      type: 'group',
      title: 'Resources',
      href: '/editor/resources',
      children: [
        {
          href: '/guides',
          title: 'Guides',
        },
        {
          href: 'https://tiptap.dev/pro-license',
          title: 'Pro license',
        },
      ],
    },
  ],
}
