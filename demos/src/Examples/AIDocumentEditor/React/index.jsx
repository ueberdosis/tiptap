import './styles.scss'

import { TableKit } from '@tiptap/extension-table'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

/**
 * PDBI Submission Document - ProseMirror JSON Format
 *
 * This demonstrates ScyAI generating a Property Damage & Business Interruption
 * insurance submission document directly in ProseMirror JSON format.
 * This is the native format that Tiptap/ProseMirror uses internally.
 */
const PDBI_CONTENT = {
  type: 'doc',
  content: [
    // Title
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Property Damage & Business Interruption Insurance Submission' }],
    },
    // Insurance Period
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Insurance Period: ' },
        { type: 'text', text: 'June 01, 2022 – May 31, 2023' },
      ],
    },
    // Prepared by
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'italic' }], text: 'Prepared by: Aon Rus – Insurance Brokers LLC' },
        { type: 'text', text: ' | February 2022' },
      ],
    },
    { type: 'horizontalRule' },

    // Section 1: Insured Information
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '1. Insured Information' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Named Insured: ' },
        { type: 'text', text: 'TCOR Industrial Holdings Ltd.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Address: ' },
        { type: 'text', text: '25 Promyshlennaya Street, Nevinnomyssk, Stavropol Krai, Russia 357107' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Industry: ' },
        { type: 'text', text: 'Chemical Manufacturing (Fertilizers & Nitrogen Compounds)' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'NAICS Code: ' },
        { type: 'text', text: '325311 - Nitrogenous Fertilizer Manufacturing' },
      ],
    },

    // Section 2: Location Schedule
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '2. Location Schedule' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'The following locations are included in this submission:' }],
    },
    // Location Table
    {
      type: 'table',
      content: [
        // Header row
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Location ID' }] }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Facility Name' }] }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Address' }] }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'TIV (USD)' }] }],
            },
          ],
        },
        // Data rows
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-001' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nevinnomyssk Main Plant' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nevinnomyssk, Stavropol' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '$485,000,000' }] }],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-002' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ammonia Production Unit' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nevinnomyssk, Stavropol' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '$215,000,000' }] }],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-003' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Storage & Distribution' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rostov-on-Don' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '$78,500,000' }] }],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Total Insured Value (TIV): ' },
        { type: 'text', text: '$778,500,000 USD' },
      ],
    },

    // Section 3: Risk Assessment
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '3. Risk Assessment Summary' }],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '3.1 Fire Protection Systems' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The facility at ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Nevinnomyssk' },
        {
          type: 'text',
          text: ' underwent comprehensive sprinkler system upgrades in Q3 2021. Current fire protection status:',
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Automatic Sprinkler System: ' },
                { type: 'text', text: 'NFPA 13 compliant, installed 2021' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Fire Detection: ' },
                { type: 'text', text: 'Addressable system with smoke/heat detectors throughout' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Fire Brigade: ' },
                { type: 'text', text: 'On-site industrial fire brigade (24/7), public station 4.2km' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Water Supply: ' },
                { type: 'text', text: 'Dedicated fire water tank (2,500m³), dual pump system' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '3.2 Natural Catastrophe Exposure' }],
    },
    {
      type: 'orderedList',
      attrs: { start: 1 },
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Earthquake: ' },
                { type: 'text', text: 'Low exposure (Seismic Zone 1). No significant historical events.' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Flood: ' },
                {
                  type: 'text',
                  text: 'Moderate exposure. Facility located 800m from Kuban River. Flood mitigation measures in place.',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Windstorm: ' },
                { type: 'text', text: 'Low exposure. Max recorded wind speed: 95 km/h.' },
              ],
            },
          ],
        },
      ],
    },

    // Section 4: Coverage Requirements
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '4. Coverage Requirements' }],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '4.1 Property Damage Coverage' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'All Risks of Physical Loss or Damage' }] }],
        },
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Including Fire, Explosion, Machinery Breakdown' }] },
          ],
        },
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Natural Catastrophe sub-limits as per schedule' }] },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '4.2 Business Interruption Coverage' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Indemnity Period: ' },
                { type: 'text', text: '24 months' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Gross Profit Declaration: ' },
                { type: 'text', text: '$156,000,000 annual' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Waiting Period: ' },
                { type: 'text', text: '14 days (72 hours for Machinery Breakdown)' },
              ],
            },
          ],
        },
      ],
    },

    // Section 5: Loss History
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '5. Loss History (Last 5 Years)' }],
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Date' }] }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Location' }] }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cause' }] }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Gross Loss' }] }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Net Paid' }] }],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mar 2020' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-001' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Compressor failure' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '$2,450,000' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '$2,200,000' }] }],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Aug 2019' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-002' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Electrical fire' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '$890,000' }] }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1 },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '$640,000' }] }],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'Note: No losses exceeding $250,000 deductible in the past 18 months.',
        },
      ],
    },

    // Section 6: Requested Terms
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '6. Requested Terms' }],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Limit of Liability: ' },
            { type: 'text', text: '$500,000,000 any one occurrence' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Deductible: ' },
            { type: 'text', text: '$250,000 PD / 14 days BI' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Target Premium: ' },
            { type: 'text', text: '$1,200,000 - $1,450,000' },
          ],
        },
      ],
    },

    // Section 7: Attachments
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '7. Attachments' }],
    },
    {
      type: 'orderedList',
      attrs: { start: 1 },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Statement of Values (SOV) - Excel format' }] },
          ],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Risk Engineering Survey Report (2021)' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Fire Protection System Certificates' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Business Interruption Worksheet' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Expiring Policy Declarations' }] }],
        },
      ],
    },

    { type: 'horizontalRule' },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'This submission is prepared for quotation purposes only. All information is provided by the insured and believed to be accurate. Final terms subject to underwriting review.',
        },
      ],
    },
  ],
}

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TableKit.configure({
        table: { resizable: true },
      }),
    ],
    content: PDBI_CONTENT,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <EditorContent editor={editor} />
    </>
  )
}
