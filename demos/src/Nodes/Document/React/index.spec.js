context('/src/Nodes/Document/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/Document/React/')
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
