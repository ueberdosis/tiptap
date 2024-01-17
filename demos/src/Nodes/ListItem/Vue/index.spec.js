context('/src/Nodes/ListItem/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/ListItem/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<ul><li>Example Text</li></ul>')
    })
  })

  it('should add a new list item on Enter', () => {
    cy.get('.tiptap')
      .type('{enter}2nd Item')

    cy.get('.tiptap')
      .find('li:nth-child(1)')
      .should('contain', 'Example Text')

    cy.get('.tiptap')
      .find('li:nth-child(2)')
      .should('contain', '2nd Item')
  })

  it('should sink the list item on Tab', () => {
    cy.get('.tiptap')
      .type('{enter}')
      .trigger('keydown', { key: 'Tab' })

    cy.get('.tiptap').type('2nd Level')

    cy.get('.tiptap')
      .find('li:nth-child(1) li')
      .should('contain', '2nd Level')
  })

  it('should lift the list item on Shift+Tab', () => {
    cy.get('.tiptap')
      .type('{enter}')
      .trigger('keydown', { key: 'Tab' })
      .trigger('keydown', { shiftKey: true, key: 'Tab' })

    cy.get('.tiptap').type('1st Level')

    cy.get('.tiptap')
      .find('li:nth-child(2)')
      .should('contain', '1st Level')
  })
})
