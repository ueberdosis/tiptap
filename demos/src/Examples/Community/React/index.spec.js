context('/src/Examples/Community/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Community/React/')
  })

  it('should count the characters correctly', () => {
    // check if count text is "44/280 characters"
    cy.get('.character-count__text').should('have.text', '44/280 characters')

    // type in .ProseMirror
    cy.get('.ProseMirror').type(' Hello World')
    cy.get('.character-count__text').should('have.text', '56/280 characters')

    // remove content from .ProseMirror and enter text
    cy.get('.ProseMirror').type('{selectall}{backspace}Hello World')
    cy.get('.character-count__text').should('have.text', '11/280 characters')
  })

  it('should mention a user', () => {
    cy.get('.ProseMirror').type('{selectall}{backspace}@')

    // check if the mention autocomplete is visible
    cy.get('.tippy-content .items').should('be.visible')

    // select the first user
    cy.get('.tippy-content .items .item').first().then($el => {
      const name = $el.text()

      $el.click()

      // check if the user is mentioned
      cy.get('.ProseMirror').should('have.text', `@${name} `)
      cy.get('.character-count__text').should('have.text', '2/280 characters')
    })

  })
})
