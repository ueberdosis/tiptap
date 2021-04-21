context('/demos/Nodes/Document', () => {
  before(() => {
    cy.visit('/demos/Nodes/Document')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p></p>')
    })
  })

  it('should return the document in as json', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
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
