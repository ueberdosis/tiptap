context('/src/GuideContent/ExportJSON/Vue/', () => {
  before(() => {
    cy.visit('/src/GuideContent/ExportJSON/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
  })

  it('should return json', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      const json = editor.getJSON()

      expect(json).to.deep.equal({
        type: 'doc',
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
})
