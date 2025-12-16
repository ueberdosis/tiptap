import type { JSONContent } from '@tiptap/react'

/**
 * Example PDBI (Property Damage & Business Interruption) Submission
 *
 * This represents a typical insurance submission document that ScyAI would
 * generate and pass to the editor fragment for review/editing.
 *
 * Based on: Aon Rus Insurance Submission for TCOR
 * Period: June 01, 2022 – May 31, 2023
 */
export const PDBI_SUBMISSION: JSONContent = {
  type: 'doc',
  content: [
    // Cover Section
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Property Damage & Business Interruption Insurance Submission' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Insurance Period: ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'June 01, 2022 – May 31, 2023' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Prepared by: ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'Aon Rus – Insurance Brokers LLC' },
        { type: 'text', text: ' | February 2022' },
      ],
    },
    {
      type: 'horizontalRule',
    },

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
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Location ID' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Facility Name' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Address' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'TIV (USD)' }] }] },
          ],
        },
        {
          type: 'tableRow',
          content: [
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-001' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nevinnomyssk Main Plant' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nevinnomyssk, Stavropol' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$485,000,000' }] }] },
          ],
        },
        {
          type: 'tableRow',
          content: [
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-002' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ammonia Production Unit' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nevinnomyssk, Stavropol' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$215,000,000' }] }] },
          ],
        },
        {
          type: 'tableRow',
          content: [
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-003' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Storage & Distribution' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rostov-on-Don' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$78,500,000' }] }] },
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
        { type: 'text', text: ' underwent comprehensive sprinkler system upgrades in Q3 2021. Current fire protection status:' },
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
      type: 'paragraph',
      content: [{ type: 'text', text: 'The following natural hazard exposures have been identified:' }],
    },
    {
      type: 'orderedList',
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
                { type: 'text', text: 'Moderate exposure. Facility located 800m from Kuban River. Flood mitigation measures in place.' },
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
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'All Risks of Physical Loss or Damage' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Including Fire, Explosion, Machinery Breakdown' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Natural Catastrophe sub-limits as per schedule' }],
            },
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
      type: 'paragraph',
      content: [{ type: 'text', text: 'The following material losses have been reported:' }],
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Date' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Location' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cause' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Gross Loss' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Net Paid' }] }] },
          ],
        },
        {
          type: 'tableRow',
          content: [
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mar 2020' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-001' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Compressor failure' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$2,450,000' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$2,200,000' }] }] },
          ],
        },
        {
          type: 'tableRow',
          content: [
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Aug 2019' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LOC-002' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Electrical fire' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$890,000' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '$640,000' }] }] },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'italic' }], text: 'Note: No losses exceeding $250,000 deductible in the past 18 months.' },
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
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Statement of Values (SOV) - Excel format' }] }],
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

    // Footer
    {
      type: 'horizontalRule',
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'italic' }], text: 'This submission is prepared for quotation purposes only. All information is provided by the insured and believed to be accurate. Final terms subject to underwriting review.' },
      ],
    },
  ],
}

/**
 * ScyAI Fragment metadata that would accompany the document
 */
export const PDBI_FRAGMENT_METADATA = {
  fragmentId: 'pdbi-tcor-2022-001',
  documentType: 'pdbi_submission' as const,
  blueprintId: 'blueprint-pdbi-v2',
  state: 'draft' as const,
  sectionState: {
    'section-0': 'complete',    // Insured Information
    'section-1': 'complete',    // Location Schedule
    'section-2': 'in_progress', // Risk Assessment
    'section-3': 'pending',     // Coverage Requirements
    'section-4': 'pending',     // Loss History
    'section-5': 'pending',     // Requested Terms
    'section-6': 'pending',     // Attachments
  },
  generatedBy: 'scyai-reasoning-engine-v3',
  generatedAt: new Date().toISOString(),
  sourceDocuments: [
    { id: 'doc-001', name: 'Previous PDBI Policy.pdf', type: 'pdf' },
    { id: 'doc-002', name: 'Risk Survey 2021.pdf', type: 'pdf' },
    { id: 'doc-003', name: 'SOV_TCOR_2022.xlsx', type: 'excel' },
  ],
}
