context('/api/extensions/heading', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/heading')

    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should make the selected line a h1', () => {
    cy.get('.ProseMirror h1').should('not.exist')
    cy.get('.demo__preview button:nth-child(1)').click({ force: true })
    cy.get('.ProseMirror').contains('h1', 'Example Text')
  })

  it('the button should make the selected line a h2', () => {
    cy.get('.ProseMirror h2').should('not.exist')
    cy.get('.demo__preview button:nth-child(2)').click({ force: true })
    cy.get('.ProseMirror').contains('h2', 'Example Text')
  })

  it('the button should make the selected line a h3', () => {
    cy.get('.ProseMirror h3').should('not.exist')
    cy.get('.demo__preview button:nth-child(3)').click({ force: true })
    cy.get('.ProseMirror').contains('h3', 'Example Text')
  })
})