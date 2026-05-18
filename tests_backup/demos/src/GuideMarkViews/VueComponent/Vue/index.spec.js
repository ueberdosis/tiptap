/// <reference types="cypress" />

context('/src/GuideMarkViews/VueComponent/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/GuideMarkViews/VueComponent/Vue/')
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p><vue-component>Mark View Text</vue-component>')
    })
    cy.get('.tiptap').type('{selectall}')
  })

  it('should show the markview', () => {
    cy.get('.tiptap').find('[data-test-id="mark-view"]').should('exist')
  })

  it('should allow clicking the button', () => {
    cy.get('.tiptap').find('[data-test-id="count-button"]').should('contain', 'This button has been clicked 0 times.')
    cy.get('.tiptap')
      .find('[data-test-id="count-button"]')
      .click()
      .then(() => {
        cy.get('.tiptap')
          .find('[data-test-id="count-button"]')
          .should('contain', 'This button has been clicked 1 times.')
      })
  })

  it('should update the attributes of the mark on button click', () => {
    cy.get('.tiptap').find('[data-test-id="mark-view').should('have.attr', 'data-count', '0')

    // click on the button
    cy.get('.tiptap')
      .find('[data-test-id="update-attributes-button"]')
      .click()
      .then(() => {
        requestAnimationFrame(() => {
          cy.get('.tiptap').find('[data-test-id="mark-view"]').should('have.attr', 'data-count', '1')
        })
      })
  })
})
