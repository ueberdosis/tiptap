context('/src/Examples/Transition/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Transition/Vue/')
  })

  it('should have two buttons and no active tiptap instance', () => {
    cy.get('.tiptap').should('not.exist')

    cy.get('#toggle-direct-editor').should('exist')
    cy.get('#toggle-nested-editor').should('exist')
  })

  it('clicking the buttons should show two editors', () => {
    cy.get('#toggle-direct-editor').click()
    cy.get('#toggle-nested-editor').click()

    cy.get('.tiptap').should('exist')
    cy.get('.tiptap').should('be.visible')
  })

  it('clicking the buttons again should hide the editors', () => {
    cy.get('#toggle-direct-editor').click()
    cy.get('#toggle-nested-editor').click()

    cy.get('.tiptap').should('exist')
    cy.get('.tiptap').should('be.visible')

    cy.get('#toggle-direct-editor').click()
    cy.get('#toggle-nested-editor').click()

    cy.get('.tiptap').should('not.exist')
  })
})
