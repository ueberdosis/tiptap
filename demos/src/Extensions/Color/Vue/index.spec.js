context('/src/Extensions/Color/Vue/', () => {
  before(() => {
    cy.visit('/src/Extensions/Color/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
    cy.get('.tiptap').type('{selectall}')
  })

  it('should set the color of the selected text', () => {
    cy.get('button:first')
      .should('not.have.class', 'is-active')
      .click()
      .should('have.class', 'is-active')

    cy.get('.tiptap')
      .find('span')
      .should('have.attr', 'style', 'color: #958DF1')
  })

  it('should remove the color of the selected text', () => {
    cy.get('button:first')
      .click()

    cy.get('.tiptap span').should('exist')

    cy.get('button:last')
      .click()

    cy.get('.tiptap span').should('not.exist')
  })

  it('should change text color with color picker', () => {
    cy.get('input[type=color]')
      .invoke('val', '#ff0000')
      .trigger('input')

    cy.get('.tiptap')
      .find('span')
      .should('have.attr', 'style', 'color: #ff0000')
  })

  it('should match text and color picker color values', () => {
    cy.get('button:first')
      .click()

    cy.get('input[type=color]')
      .should('have.value', '#958df1')
  })
})
