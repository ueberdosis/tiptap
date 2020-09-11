context('/examples/export-html-or-json', () => {
  beforeEach(() => {
    cy.visit('/examples/export-html-or-json')
  })

  it('should return json', () => {
    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      const json = editor.json()

      expect(json).to.deep.equal({
        'type': 'document',
        'content': [
          {
            'type': 'paragraph',
            'content': [
              {
                'type': 'text',
                'text': 'You are able to export your data as '
              },
              {
                'type': 'text',
                'marks': [
                  {
                    'type': 'code'
                  }
                ],
                'text': 'HTML'
              },
              {
                'type': 'text',
                'text': ' or '
              },
              {
                'type': 'text',
                'marks': [
                  {
                    'type': 'code'
                  }
                ],
                'text': 'JSON'
              },
              {
                'type': 'text',
                'text': '.'
              }
            ]
          }
        ]
      })
    })
  })

  it('should return html', () => {
    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      const html = editor.html()

      expect(html).to.equal('<p>You are able to export your data as <code>HTML</code> or <code>JSON</code>.</p>')
    })
  })
})