context('/src/Extensions/FontSize/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/FontSize/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
    cy.get('.tiptap').type('{selectall}')
  })

  it('should set the font-size of the selected text', () => {
    cy.get('[data-test-id="28px"]').should('not.have.class', 'is-active').click().should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'font-size: 28px')
  })

  it('should remove the font-size of the selected text', () => {
    cy.get('[data-test-id="28px"]').click()
    cy.get('.tiptap').find('span').should('have.attr', 'style', 'font-size: 28px')
    cy.get('[data-test-id="unsetFontSize"]').click()
    cy.get('.tiptap').get('span').should('not.exist')
  })
})
