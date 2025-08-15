// Minimal ProseMirror JSON -> Markdown serializer stub.
// Will traverse the document and call `renderMarkdown` on nodes/marks when available.

export function markdownSerializer(doc: any) {
  if (!doc || !Array.isArray(doc.content)) {
    return ''
  }

  const parts: string[] = []
  doc.content.forEach((node: any) => {
    if (node.type === 'paragraph') {
      const text = (node.content || []).map((n: any) => n.text || '').join('')
      parts.push(text)
    }
  })
  return parts.join('\n\n')
}
