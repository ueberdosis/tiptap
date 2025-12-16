import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import React from 'react'

/**
 * PDBI Submission Document
 *
 * This demonstrates ScyAI loading a Property Damage & Business Interruption
 * insurance submission document into a Tiptap editor for review/editing.
 */
const PDBI_CONTENT = `
<h1>Property Damage & Business Interruption Insurance Submission</h1>
<p><strong>Insurance Period:</strong> June 01, 2022 – May 31, 2023</p>
<p><em>Prepared by: Aon Rus – Insurance Brokers LLC</em> | February 2022</p>
<hr>

<h2>1. Insured Information</h2>
<p><strong>Named Insured:</strong> TCOR Industrial Holdings Ltd.</p>
<p><strong>Address:</strong> 25 Promyshlennaya Street, Nevinnomyssk, Stavropol Krai, Russia 357107</p>
<p><strong>Industry:</strong> Chemical Manufacturing (Fertilizers & Nitrogen Compounds)</p>
<p><strong>NAICS Code:</strong> 325311 - Nitrogenous Fertilizer Manufacturing</p>

<h2>2. Location Schedule</h2>
<p>The following locations are included in this submission:</p>
<table>
  <tr>
    <th>Location ID</th>
    <th>Facility Name</th>
    <th>Address</th>
    <th>TIV (USD)</th>
  </tr>
  <tr>
    <td>LOC-001</td>
    <td>Nevinnomyssk Main Plant</td>
    <td>Nevinnomyssk, Stavropol</td>
    <td>$485,000,000</td>
  </tr>
  <tr>
    <td>LOC-002</td>
    <td>Ammonia Production Unit</td>
    <td>Nevinnomyssk, Stavropol</td>
    <td>$215,000,000</td>
  </tr>
  <tr>
    <td>LOC-003</td>
    <td>Storage & Distribution</td>
    <td>Rostov-on-Don</td>
    <td>$78,500,000</td>
  </tr>
</table>
<p><strong>Total Insured Value (TIV):</strong> $778,500,000 USD</p>

<h2>3. Risk Assessment Summary</h2>
<h3>3.1 Fire Protection Systems</h3>
<p>The facility at <strong>Nevinnomyssk</strong> underwent comprehensive sprinkler system upgrades in Q3 2021. Current fire protection status:</p>
<ul>
  <li><strong>Automatic Sprinkler System:</strong> NFPA 13 compliant, installed 2021</li>
  <li><strong>Fire Detection:</strong> Addressable system with smoke/heat detectors throughout</li>
  <li><strong>Fire Brigade:</strong> On-site industrial fire brigade (24/7), public station 4.2km</li>
  <li><strong>Water Supply:</strong> Dedicated fire water tank (2,500m³), dual pump system</li>
</ul>

<h3>3.2 Natural Catastrophe Exposure</h3>
<ol>
  <li><strong>Earthquake:</strong> Low exposure (Seismic Zone 1). No significant historical events.</li>
  <li><strong>Flood:</strong> Moderate exposure. Facility located 800m from Kuban River. Flood mitigation measures in place.</li>
  <li><strong>Windstorm:</strong> Low exposure. Max recorded wind speed: 95 km/h.</li>
</ol>

<h2>4. Coverage Requirements</h2>
<h3>4.1 Property Damage Coverage</h3>
<ul>
  <li>All Risks of Physical Loss or Damage</li>
  <li>Including Fire, Explosion, Machinery Breakdown</li>
  <li>Natural Catastrophe sub-limits as per schedule</li>
</ul>

<h3>4.2 Business Interruption Coverage</h3>
<ul>
  <li><strong>Indemnity Period:</strong> 24 months</li>
  <li><strong>Gross Profit Declaration:</strong> $156,000,000 annual</li>
  <li><strong>Waiting Period:</strong> 14 days (72 hours for Machinery Breakdown)</li>
</ul>

<h2>5. Loss History (Last 5 Years)</h2>
<table>
  <tr>
    <th>Date</th>
    <th>Location</th>
    <th>Cause</th>
    <th>Gross Loss</th>
    <th>Net Paid</th>
  </tr>
  <tr>
    <td>Mar 2020</td>
    <td>LOC-001</td>
    <td>Compressor failure</td>
    <td>$2,450,000</td>
    <td>$2,200,000</td>
  </tr>
  <tr>
    <td>Aug 2019</td>
    <td>LOC-002</td>
    <td>Electrical fire</td>
    <td>$890,000</td>
    <td>$640,000</td>
  </tr>
</table>
<p><em>Note: No losses exceeding $250,000 deductible in the past 18 months.</em></p>

<h2>6. Requested Terms</h2>
<blockquote>
  <p><strong>Limit of Liability:</strong> $500,000,000 any one occurrence</p>
  <p><strong>Deductible:</strong> $250,000 PD / 14 days BI</p>
  <p><strong>Target Premium:</strong> $1,200,000 - $1,450,000</p>
</blockquote>

<h2>7. Attachments</h2>
<ol>
  <li>Statement of Values (SOV) - Excel format</li>
  <li>Risk Engineering Survey Report (2021)</li>
  <li>Fire Protection System Certificates</li>
  <li>Business Interruption Worksheet</li>
  <li>Expiring Policy Declarations</li>
</ol>

<hr>
<p><em>This submission is prepared for quotation purposes only. All information is provided by the insured and believed to be accurate. Final terms subject to underwriting review.</em></p>
`

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
