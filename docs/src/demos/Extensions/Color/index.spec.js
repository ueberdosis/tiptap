context('/demos/Extensions/Color', () => {
  before(() => {
    cy.visit('/demos/Extensions/Color')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
    cy.get('.ProseMirror').type('{selectall}')
  })

  it('should set the color of the selected text', () => {
    cy.get('button:first')
      .should('not.have.class', 'is-active')
      .click()
      .should('have.class', 'is-active')

    cy.get('.ProseMirror')
      .find('span')
      .should('have.attr', 'style', 'color: #958DF1')
  })

  it('should remove the color of the selected text', () => {
    cy.get('button:first')
      .click()

    cy.get('.ProseMirror span').should('exist')

    cy.get('button:last')
      .click()

    cy.get('.ProseMirror span').should('not.exist')
  })

  it('should change text color with color picker', () => {
    cy.get('input[type=color]')
      .invoke('val', '#ff0000')
      .trigger('input')

    cy.get('.ProseMirror')
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
