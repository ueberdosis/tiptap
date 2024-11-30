context('/src/Nodes/Text/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/Text/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.tiptap').type('Example Text').find('p').should('contain', 'Example Text')
  })
})
