context('/api/extensions/code', () => {
  before(() => {
    cy.visit('/api/extensions/code')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.focus()
      editor.selectAll()
    })
  })

  it('should mark the selected text as inline code', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').find('code').should('contain', 'Example Text')
  })

  it('should toggle the selected text as inline code', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror code').should('not.exist')
  })
})