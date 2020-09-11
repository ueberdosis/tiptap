context('/api/extensions/paragraph', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/paragraph')
    
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.clearContent()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.ProseMirror').type('Example Text', { force: true })
    cy.get('.ProseMirror').contains('p', 'Example Text')
    cy.get('.ProseMirror').find('p').should('have.length', 1)
  })

  it('enter should make a new paragraph', () => {
    cy.get('.ProseMirror').type('First Paragraph{enter}Second Paragraph', { force: true })
    cy.get('.ProseMirror').find('p').should('have.length', 2)
    cy.get('.ProseMirror').contains('p:first', 'First Paragraph')
    cy.get('.ProseMirror').contains('p:nth-child(2)', 'Second Paragraph')
  })

  it('backspace should remove the second paragraph', () => {
    cy.get('.ProseMirror').type('{enter}', { force: true })
    cy.get('.ProseMirror').find('p').should('have.length', 2)
    cy.get('.ProseMirror').type('{backspace}', { force: true })
    cy.get('.ProseMirror').find('p').should('have.length', 1)
  })
})