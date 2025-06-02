context('/src/Nodes/Text/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/Text/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.tiptap')
      .type('Example Text')
      .find('p')
      .should('contain', 'Example Text')
  })
})
