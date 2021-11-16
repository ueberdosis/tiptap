context('/src/Nodes/Text/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/Text/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.ProseMirror').type('Example Text').find('p').should('contain', 'Example Text')
  })
})
