context('/src/Examples/JSX/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/JSX/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should have paragraphs colored as red', () => {
    cy.get('.tiptap p').should('have.css', 'color', 'rgb(255, 0, 0)')
  })
})
