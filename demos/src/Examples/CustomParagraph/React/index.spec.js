context('/src/Examples/CustomParagraph/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/CustomParagraph/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should have a paragraph and text length', () => {
    cy.get('.tiptap p').should('exist').should('have.text', 'Each line shows the number of characters in the paragraph.')
    cy.get('.tiptap .label').should('exist').should('have.text', '58')
  })

  it('should have new paragraph', () => {
    cy.get('.tiptap').type('{selectall}{moveToEnd}{enter}')
    cy.get('.tiptap p').eq(1).should('exist').should('have.text', '')
    cy.get('.tiptap .label').eq(1).should('exist').should('have.text', '0')
  })
})
