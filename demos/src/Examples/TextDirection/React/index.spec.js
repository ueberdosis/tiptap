context('/src/Examples/TextDirection/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/TextDirection/React/')
  })

  it('should apply text direction attributes', () => {
    cy.get('.tiptap p').first().should('have.attr', 'dir', 'auto')
  })

  it('should change global direction', () => {
    cy.get('button').contains('RTL').click()
    cy.get('.tiptap p').first().should('have.attr', 'dir', 'rtl')
  })

  it('should set direction on selection', () => {
    cy.get('.tiptap p').first().click()
    cy.get('button').contains('Set LTR').click()
    cy.get('.tiptap p').first().should('have.attr', 'dir', 'ltr')
  })

  it('should unset direction', () => {
    cy.get('button').contains('None').click()
    cy.get('.tiptap p').first().should('not.have.attr', 'dir')
  })
})
