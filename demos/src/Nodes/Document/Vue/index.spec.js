context('/src/Nodes/Document/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/Document/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p></p>')
    })
  })

  it('should return the document in as json', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      const json = editor.getJSON()

      expect(json).to.deep.equal({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
          },
        ],
      })
    })
  })
})
