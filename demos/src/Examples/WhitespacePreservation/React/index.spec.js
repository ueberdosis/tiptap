context('/src/Examples/WhitespacePreservation/React/', () => {
  before(() => {
    cy.visit('/src/Examples/WhitespacePreservation/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should preserve multiple spaces when preserveWhitespace is true', () => {
    cy.get('.tiptap').type('Hello    world')
    cy.get('.tiptap p').should('contain', '    ')
  })

  it('should preserve tabs when preserveWhitespace is true', () => {
    cy.get('.tiptap').type('Hello\tworld')
    cy.get('.tiptap').then(([{ editor }]) => {
      const html = editor.getHTML()
      expect(html).to.include('white-space: pre-wrap')
    })
  })

  it('should render with white-space: pre-wrap style', () => {
    cy.get('.tiptap p').should('have.attr', 'style').and('include', 'white-space: pre-wrap')
  })
})
