context('/src/Nodes/ListItem/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/ListItem/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<ul><li>Example Text</li></ul>')
    })
  })

  it('should add a new list item on Enter', () => {
    cy.get('.ProseMirror').type('{enter}2nd Item')

    cy.get('.ProseMirror').find('li:nth-child(1)').should('contain', 'Example Text')

    cy.get('.ProseMirror').find('li:nth-child(2)').should('contain', '2nd Item')
  })

  it('should sink the list item on Tab', () => {
    cy.get('.ProseMirror').type('{enter}').trigger('keydown', { key: 'Tab' })

    cy.get('.ProseMirror').type('2nd Level')

    cy.get('.ProseMirror').find('li:nth-child(1) li').should('contain', '2nd Level')
  })

  it('should lift the list item on Shift+Tab', () => {
    cy.get('.ProseMirror')
      .type('{enter}')
      .trigger('keydown', { key: 'Tab' })
      .trigger('keydown', { shiftKey: true, key: 'Tab' })

    cy.get('.ProseMirror').type('1st Level')

    cy.get('.ProseMirror').find('li:nth-child(2)').should('contain', '1st Level')
  })
})
