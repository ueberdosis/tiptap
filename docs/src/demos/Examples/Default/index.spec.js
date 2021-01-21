context('/examples/default', () => {
  before(() => {
    cy.visit('/examples/default')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Example Text</h1>')
      editor.commands.selectAll()
    })
  })

  it('should apply the paragraph style when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror h1').should('exist')
    cy.get('.ProseMirror p').should('not.exist')

    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, altKey: true, key: '0' })
      .find('p')
      .should('contain', 'Example Text')
  })
})
