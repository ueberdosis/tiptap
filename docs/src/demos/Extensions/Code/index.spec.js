context('/api/extensions/code', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/code')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Example Text</p>')
      editor.focus().selectAll()
    })
  })

  describe('code', () => {
    it('should mark the selected text as inline code', () => {
      cy.get('.demo__preview button:first').click({ force: true })
      cy.get('.ProseMirror').contains('code', 'Example Text')
    })

    it('should toggle the selected text as inline code', () => {
      cy.get('.demo__preview button:first').dblclick({ force: true })
      cy.get('.ProseMirror code').should('not.exist')
    })
  })
})