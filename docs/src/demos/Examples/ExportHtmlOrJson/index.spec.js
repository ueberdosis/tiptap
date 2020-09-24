context('/examples/export-html-or-json', () => {
  before(() => {
    cy.visit('/examples/export-html-or-json')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
    })
  })

  it('should return json', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      const json = editor.json()

      expect(json).to.deep.equal({
        type: 'document',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Example Text',
              },
            ],
          },
        ],
      })
    })
  })

  it('should return html', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      const html = editor.html()

      expect(html).to.equal('<p>Example Text</p>')
    })
  })
})
