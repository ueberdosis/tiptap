context('/api/extensions/bullet-list', () => {
  before(() => {
    cy.visit('/api/extensions/bullet-list')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  // it('should make a bullet list from different markdown shortcuts', () => {
  //   cy.get('.ProseMirror').then(([{ editor }]) => {
  //     editor.clearContent()
  //   })

  //   cy.get('.ProseMirror')
  //     .type('* List Item 1{enter}+ List Item 2{enter}- List Item 3')

  //   cy.get('.ProseMirror')
  //     .find('li:nth-child(1)')
  //     .should('contain', 'List Item 1')

  //   cy.get('.ProseMirror')
  //     .find('li:nth-child(2)')
  //     .should('contain', 'List Item 2')

  //   cy.get('.ProseMirror')
  //     .find('li:nth-child(3)')
  //     .should('contain', 'List Item 3')
  // })
})