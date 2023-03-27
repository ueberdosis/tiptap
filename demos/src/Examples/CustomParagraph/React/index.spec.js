context('/src/Examples/CustomParagraph/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/CustomParagraph/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should have a paragraph and text length', () => {
    cy.get('.ProseMirror p').should('exist').should('have.text', 'Each line shows the number of characters in the paragraph.')
    cy.get('.ProseMirror .label').should('exist').should('have.text', '58')
  })

  it('should have new paragraph', () => {
    cy.get('.ProseMirror').type('{selectall}{moveToEnd}{enter}')
    cy.get('.ProseMirror p').eq(1).should('exist').should('have.text', '')
    cy.get('.ProseMirror .label').eq(1).should('exist').should('have.text', '0')
  })
})
