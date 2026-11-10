import { z } from 'zod'

import type { JsonItem } from '../types/json-item.js'

// The chart schemas follow `core/spec/schemas.ts` of @tiptap-pro/extension-diagrams 0.1.0

const lineStyles = ['solid', 'dashed', 'dotted'] as const

const figureSize = z
  .object({
    width: z.number().min(0.1).max(1),
    ratio: z.number().min(0.25).max(8),
    locked: z.boolean().optional().describe('Dragging a corner keeps the ratio.'),
    align: z
      .enum(['left', 'center', 'right'])
      .optional()
      .describe('Where a figure narrower than its column stands. center by default.'),
  })
  .describe(
    'Leave out for the full column width. width is a share of the column (0.1 to 1), ratio is width divided by height.',
  )

const chartData = z
  .object({
    columns: z
      .array(
        z.object({
          id: z.string().optional().describe('Optional; derived from the label when left out.'),
          label: z.string().describe('The header: the name of the series or of the label column.'),
          role: z.enum(['label', 'series']),
        }),
      )
      .min(2),
    rows: z.array(
      z
        .array(z.union([z.string(), z.number(), z.null()]))
        .describe('One cell per column, in the order of the columns. null is a gap.'),
    ),
  })
  .describe(
    'The numbers behind a chart, as a table. Exactly one column has the role "label" (the category or x value of each row); every other column is a series. The order of rows is the order of categories.',
  )

const stroke = z.object({
  line: z.enum(['none', ...lineStyles]).optional(),
  width: z.number().min(0.5).max(4).optional(),
  color: z
    .string()
    .optional()
    .describe('A CSS color; without it the theme decides. Word reads only #rrggbb.'),
  every: z
    .int()
    .min(1)
    .optional()
    .describe(
      'x.grid only: a line at every nth category, starting with the first. 3 draws one at every third.',
    ),
  at: z
    .array(z.int().min(0))
    .optional()
    .describe('x.grid only: lines only at these categories, counted from 0. Wins over every.'),
})

const axis = z
  .object({
    title: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z
      .number()
      .positive()
      .optional()
      .describe(
        'y only: the distance between two ticks and value grid lines; 25 puts them at 0, 25, 50 and so on.',
      ),
    grid: stroke
      .optional()
      .describe(
        'Grid lines across the plot at each category (x) or value (y). By default only y has them. On a radar, y.grid are the rings and x.line the spokes.',
      ),
    line: stroke.optional().describe('The axis line. By default x has one and y none.'),
    labels: z
      .object({
        every: z
          .int()
          .min(1)
          .optional()
          .describe('A label at every nth category, starting with the first.'),
        at: z
          .array(z.int().min(0))
          .optional()
          .describe('Labels only at these categories, counted from 0. Wins over every.'),
        angle: z
          .number()
          .min(-90)
          .max(90)
          .optional()
          .describe(
            'Degrees the labels are turned counterclockwise; 45 rises to the right and ends at its category.',
          ),
      })
      .optional()
      .describe(
        'x only: which category labels are written and at what angle, for long labels or a narrow chart. Without every or at, labels that would overlap may be left out.',
      ),
  })
  .describe('x is the category axis, y the value axis, also for horizontal bars.')

const chartSpec = z
  .looseObject({
    type: z
      .string()
      .regex(/^[\w-]{1,64}$/)
      .describe(
        'A chart type id: line, bar, area, scatter, pie, doughnut, matrix, radar, funnel, gauge, treemap, combo, tree, sankey, network, or one the editor registered.',
      ),
    title: z.string().optional(),
    description: z.string().optional().describe('Alt text: what the chart shows, in a sentence.'),
    caption: z
      .boolean()
      .optional()
      .describe('Shows the description as a visible caption below the chart.'),
    background: z
      .string()
      .optional()
      .describe('A solid CSS color behind the chart, such as "#f8fafc".'),
    border: z.boolean().optional().describe('A frame around the chart.'),
    hidden: z
      .boolean()
      .optional()
      .describe(
        'Set by the editor while only the table the chart follows is shown. Keep it as it is.',
      ),
    legend: z
      .object({
        show: z.boolean().optional(),
        position: z.enum(['top', 'right', 'bottom', 'left']).optional(),
      })
      .optional(),
    palette: z.array(z.string()).optional().describe('CSS colors, one per series.'),
    series: z
      .record(
        z.string(),
        z.object({
          line: z.enum(lineStyles).optional(),
          width: z.number().min(0.5).max(8).optional(),
          marker: z.enum(['none', 'circle', 'square']).optional(),
          smooth: z.boolean().optional(),
          as: z
            .enum(['bar', 'line'])
            .optional()
            .describe('combo charts: bars (the default) or a line.'),
          axis: z
            .enum(['left', 'right'])
            .optional()
            .describe('combo charts: right puts the series on a second value axis.'),
        }),
      )
      .optional()
      .describe('How each series of a line, area or combo chart is drawn, keyed by column id.'),
    style: z
      .string()
      .regex(/^[\w-]{1,64}$/)
      .optional()
      .describe(
        'A registered style by id, such as "ocean"; palette, background and border override it.',
      ),
    axes: z.object({ x: axis.optional(), y: axis.optional() }).optional(),
    references: z
      .array(
        z.object({
          value: z.number().optional().describe('A line at this value.'),
          from: z.number().optional().describe('A band from this value, together with to.'),
          to: z.number().optional(),
          label: z
            .string()
            .optional()
            .describe('Written at the line or in the band, such as "Target".'),
          labelAt: z
            .enum(['start', 'end'])
            .optional()
            .describe('Which end the label stands at, along the category axis; end by default.'),
          color: z.string().optional().describe('A CSS color; a band is a light tint of it.'),
          line: z.enum(lineStyles).optional().describe('A line only; dashed by default.'),
          width: z.number().min(0.5).max(4).optional().describe('A line only; 1.5 by default.'),
        }),
      )
      .max(20)
      .optional()
      .describe(
        'Charts with axes: lines and bands at values of the value axis, drawn across the plot. A line at value, such as a target, or a band from one value to another, such as the range to stay in.',
      ),
    encoding: z
      .object({
        label: z.string().optional(),
        series: z.array(z.string()).optional(),
        seriesIn: z
          .enum(['columns', 'rows'])
          .optional()
          .describe(
            'rows swaps rows and columns: each row becomes a series, each series column a category.',
          ),
      })
      .optional()
      .describe(
        'Which columns to show, by column id: label is the category column, series the columns drawn, in order. Without it, every series column.',
      ),
    stacked: z.boolean().optional(),
    innerRadius: z
      .number()
      .min(0)
      .max(0.9)
      .optional()
      .describe('Doughnut hole, as a share of the radius.'),
    orientation: z
      .enum(['vertical', 'horizontal'])
      .optional()
      .describe('bar and combo charts: horizontal lays the bars on their side.'),
    range: z
      .object({ min: z.number(), max: z.number() })
      .optional()
      .describe('gauge charts: the scale of the dial, 0 to 100 by default.'),
    size: figureSize.optional(),
    renderer: z
      .record(z.string(), z.looseObject({}))
      .optional()
      .describe(
        'Options only one Renderer understands, keyed by the Renderer id. Keep it as it is.',
      ),
  })
  .describe('How to show Chart Data. Only type is required.')

/**
 * Items for the `chart` and `flowDiagram` nodes of `@tiptap-pro/extension-diagrams`.
 */
export const diagramsJsonItems: JsonItem[] = [
  {
    extensionName: 'chart',
    name: 'Chart',
    description: [
      'A chart drawn from a table of numbers. Its data is in its data attribute, not in the document text.',
      'spec.type is the chart type, and it decides how the rows are read:',
      'line, bar, area, scatter, combo and radar: the label column names the categories, such as months, and each series column holds numbers.',
      'pie, doughnut and funnel: a label column and one series, the parts of a whole. A funnel lists stages, widest first.',
      'gauge: one row with one value.',
      'treemap and tree: the label is a path, "Europe / Germany" places Germany under Europe, and one series holds the value of each row.',
      'sankey and network: one row per link. The label column is where the link starts, the next column where it ends, as text, and the column after it the value.',
      'matrix: a grid of words, such as a RACI matrix: tasks in the label column, a column per role, R, A, C or I in the cells.',
      'A chart can have a type that the editor registered: keep it.',
      'spec.series and spec.encoding name columns by their id.',
      'When you change a chart, keep the attributes and the spec fields you do not change.',
      'Never set source or previewUrl.',
      'While source.mode is "linked", the chart reads its data from its source: leave its data as it is.',
      'When source.provider is "document-table", the chart follows the table whose chartTableId its source.address names: change that table instead, and keep its chartTableId.',
      'For a process or a flow, use a diagram instead.',
    ].join(' '),
    attributes: {
      data: chartData,
      spec: chartSpec,
    },
  },
  {
    extensionName: 'flowDiagram',
    name: 'Diagram',
    description: [
      'A diagram drawn from its source attribute, not from document text.',
      'Write Mermaid: the first line of source names the kind, such as flowchart, sequenceDiagram, stateDiagram-v2, classDiagram, erDiagram, journey, gantt, mindmap, timeline, quadrantChart, gitGraph, kanban, architecture-beta, block-beta, C4Context or requirementDiagram.',
      'No %%{init}%% directives and no frontmatter.',
      'When you change a diagram, keep the attributes you do not change, such as format, view and options.',
      'Keep the source of a drawio or bpmn diagram as it is.',
      'When options.link is set, the diagram is drawn from the table whose chartTableId options.link.tableId names: change that table instead.',
      'For a pie, xychart, sankey, radar or treemap, use a chart instead.',
    ].join(' '),
    attributes: {
      format: z
        .string()
        .optional()
        .describe('mermaid (the default), drawio, bpmn, or a format the editor registered.'),
      source: z.string().max(50000),
      title: z.string().nullable().optional().describe('Shown as a caption below the diagram.'),
      description: z.string().nullable().optional().describe('Alt text.'),
      view: z
        .enum(['diagram', 'code'])
        .optional()
        .describe('diagram shows the drawn diagram, code shows the source.'),
      options: z
        .looseObject({
          size: figureSize.optional(),
          link: z.looseObject({}).optional().describe('The table the diagram is drawn from.'),
          positions: z.looseObject({}).optional().describe('The offsets of shapes a user moved.'),
        })
        .optional()
        .describe('Settings beyond the source. Keep the keys you do not change.'),
    },
  },
]
