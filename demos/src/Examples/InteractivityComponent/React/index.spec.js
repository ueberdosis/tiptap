context('/src/Examples/InteractivityComponent/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/InteractivityComponent/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should render a custom node', () => {
    cy.get('.ProseMirror .react-component').should('have.length', 1)
  })

  it('should handle count click inside custom node', () => {
    cy.get('.ProseMirror .react-component button')
      .should('have.text', 'This button has been clicked 0 times.')
      .click()
      .should('have.text', 'This button has been clicked 1 times.')
      .click()
      .should('have.text', 'This button has been clicked 2 times.')
      .click()
      .should('have.text', 'This button has been clicked 3 times.')
  })
})
