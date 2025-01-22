/// <reference types="cypress" />

context('/src/GuideMarkViews/VueComponent/Vue/', () => {
  before(() => {
    cy.visit('/src/GuideMarkViews/VueComponent/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p><vue-component>Mark View Text</vue-component>')
    })
    cy.get('.tiptap').type('{selectall}')
  })

  it('should show the markview', () => {
    cy.get('.tiptap').find('[data-test-id="mark-view"]').should('exist')
  })

  it('should allow clicking the button', () => {
    cy.get('.tiptap')
      .find('[data-test-id="mark-view"] button')
      .should('contain', 'This button has been clicked 0 times.')
    cy.get('.tiptap')
      .find('[data-test-id="mark-view"] button')
      .click()
      .then(() => {
        cy.get('.tiptap')
          .find('[data-test-id="mark-view"] button')
          .should('contain', 'This button has been clicked 1 times.')
      })
  })
})
