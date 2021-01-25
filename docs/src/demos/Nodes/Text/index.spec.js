context('/demos/Nodes/Text', () => {
  before(() => {
    cy.visit('/demos/Nodes/Text')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.ProseMirror')
      .type('Example Text')
      .find('p')
      .should('contain', 'Example Text')
  })
})
