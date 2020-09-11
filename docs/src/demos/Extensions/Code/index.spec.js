context('/api/extensions/code', () => {
  before(() => {
    cy.visit('/api/extensions/code')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
      cy.wait(10)
    })
  })

  it('should mark the selected text as inline code', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').contains('code', 'Example Text')
  })

  it('should toggle the selected text as inline code', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror code').should('not.exist')
  })
})