context('/src/Extensions/FontFamily/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/FontFamily/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
    cy.get('.tiptap').type('{selectall}')
  })

  it('should set the font-family of the selected text', () => {
    cy.get('[data-test-id="monospace"]')
      .should('not.have.class', 'is-active')
      .click()
      .should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'font-family: monospace')
  })

  it('should remove the font-family of the selected text', () => {
    cy.get('[data-test-id="monospace"]').click()

    cy.get('.tiptap span').should('exist')

    cy.get('[data-test-id="unsetFontFamily"]').click()

    cy.get('.tiptap span').should('not.exist')
  })

  it('should allow CSS variables as a font-family', () => {
    cy.get('[data-test-id="css-variable"]')
      .should('not.have.class', 'is-active')
      .click()
      .should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'font-family: var(--title-font-family)')
  })

  it('should allow fonts containing multiple font families', () => {
    cy.get('[data-test-id="comic-sans"]')
      .should('not.have.class', 'is-active')
      .click()
      .should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'font-family: "Comic Sans MS", "Comic Sans"')
  })

  it('should allow fonts containing a space and number as a font-family', () => {
    cy.get('[data-test-id="exo2"]')
      .should('not.have.class', 'is-active')
      .click()
      .should('have.class', 'is-active')

    cy.get('.tiptap').find('span').should('have.attr', 'style', 'font-family: "Exo 2"')
  })
})
