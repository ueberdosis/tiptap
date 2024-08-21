context('/src/Extensions/Color/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/Color/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
    cy.get('.tiptap').type('{selectall}')
  })

  it('should set the color of the selected text', () => {
    cy.get('[data-testid="setPurple"]')
      .should('not.have.class', 'is-active')
      .click()
      .should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'color: #958DF1')
  })

  it('should remove the color of the selected text', () => {
    cy.get('[data-testid="setPurple"]').click()

    cy.get('.tiptap span').should('exist')

    cy.get('[data-testid="unsetColor"]').click()

    cy.get('.tiptap span').should('not.exist')
  })

  it('should change text color with color picker', () => {
    cy.get('input[type=color]').invoke('val', '#ff0000').trigger('input')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'color: #ff0000')
  })

  it('should match text and color picker color values', () => {
    cy.get('[data-testid="setPurple"]').click()

    cy.get('input[type=color]').should('have.value', '#958df1')
  })

  it('should preserve color on new lines', () => {
    cy.get('[data-testid="setPurple"]').click()
    cy.get('.ProseMirror').type('Example Text{enter}')

    cy.get('[data-testid="setPurple"]').should('have.class', 'is-active')
  })

  it('should unset color on new lines after unset clicked', () => {
    cy.get('[data-testid="setPurple"]').click()
    cy.get('.ProseMirror').type('Example Text{enter}')
    cy.get('[data-testid="unsetColor"]').click()
    cy.get('.ProseMirror').type('Example Text')

    cy.get('[data-testid="setPurple"]').should('not.have.class', 'is-active')
  })
})
