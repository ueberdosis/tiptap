context('/src/Extensions/LineHeight/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/LineHeight/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
    cy.get('.tiptap').type('{selectall}')
  })

  it('should set line-height 1.5 for the selected text', () => {
    cy.get('[data-test-id="1.5"]').should('not.have.class', 'is-active').click().should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'line-height: 1.5')
  })

  it('should set line-height 2.0 for the selected text', () => {
    cy.get('[data-test-id="2.0"]').should('not.have.class', 'is-active').click().should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'line-height: 2.0')
  })

  it('should set line-height 4.0 for the selected text', () => {
    cy.get('[data-test-id="4.0"]').should('not.have.class', 'is-active').click().should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'line-height: 4.0')
  })

  it('should remove the line-height of the selected text', () => {
    cy.get('[data-test-id="1.5"]').click()
    cy.get('.tiptap').find('span').should('have.attr', 'style', 'line-height: 1.5')

    cy.get('[data-test-id="unsetLineHeight"]').click()
    cy.get('.tiptap span').should('not.exist')
  })
})
