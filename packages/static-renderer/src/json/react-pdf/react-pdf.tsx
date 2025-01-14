import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import React from 'react'

import { renderJSONContentToReactElement } from '../react/react.js'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  h3: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  h4: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  h5: {
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  h6: {
    fontSize: 10,
    fontWeight: 'bold',
    marginVertical: 10,
  },
})

export function renderJSONContentToReactPdf() {
  return renderJSONContentToReactElement({
    nodeMapping: {
      doc: ({ children }) => (
        <Document>
          <Page size="A4" style={styles.page}>
            {children}
          </Page>
        </Document>
      ),
      paragraph: ({ children }) => <View style={styles.section}>{children}</View>,
      text: ({ node }) => <Text>{node.text}</Text>,
      heading: ({ node, children }) => {
        const level = node.attrs.level
        const hTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

        return <Text style={styles[hTag]}>{children}</Text>
      },
    },
    markMapping: {},
  })
}
