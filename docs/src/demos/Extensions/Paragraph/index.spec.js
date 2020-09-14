context('/api/extensions/paragraph', () => {
  before(() => {
    cy.visit('/api/extensions/paragraph')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.clearContent()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.ProseMirror')
      .type('Example Text', { force: true })
      .find('p')
      .should('contain', 'Example Text')
  })

  it('enter should make a new paragraph', () => {
    cy.get('.ProseMirror')
      .type('First Paragraph{enter}Second Paragraph', { force: true })
      .find('p')
      .should('have.length', 2)

    cy.get('.ProseMirror')
      .find('p:first')
      .should('contain', 'First Paragraph')

    cy.get('.ProseMirror')
      .find('p:nth-child(2)')
      .should('contain', 'Second Paragraph')
  })

  it('backspace should remove the second paragraph', () => {
    cy.get('.ProseMirror')
      .type('{enter}', { force: true })
      .find('p')
      .should('have.length', 2)

    cy.get('.ProseMirror')
      .type('{backspace}', { force: true })
      .find('p')
      .should('have.length', 1)
  })
})