export const nodeSchemaFields = {
  content: 'string',
  marks: 'string',
  group: 'string',
  inline: 'boolean',
  atom: 'boolean',
  selectable: 'boolean',
  draggable: 'boolean',
  code: 'boolean',
  whitespace: ['pre', 'normal'],
  definingAsContext: 'boolean',
  definingForContent: 'boolean',
  defining: 'boolean',
  isolating: 'boolean',
  linebreakReplacement: 'boolean',
} as const

export const markSchemaFields = {
  inclusive: 'boolean',
  excludes: 'string',
  group: 'string',
  spanning: 'boolean',
  code: 'boolean',
} as const
