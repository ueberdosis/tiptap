context('/src/Examples/Transition/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Transition/Vue/')
  })

  it('should not have an active tiptap instance but a button', () => {
    cy.get('.tiptap').should('not.exist')

    cy.get('#toggle-editor').should('exist')
  })

  it('clicking the button should show the editor', () => {
    cy.get('#toggle-editor').click()

    cy.get('.tiptap').should('exist')
    cy.get('.tiptap').should('be.visible')
  })

  it('clicking the button again should hide the editor', () => {
    cy.get('#toggle-editor').click()

    cy.get('.tiptap').should('exist')
    cy.get('.tiptap').should('be.visible')

    cy.get('#toggle-editor').click()

    cy.get('.tiptap').should('not.exist')
  })
})
