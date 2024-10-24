context('/src/Experiments/Commands/Vue/', () => {
  before(() => {
    cy.visit('/src/Experiments/Commands/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should open a popup after typing a slash', () => {
    const items = [
      { tag: 'h1' },
      { tag: 'h2' },
      { tag: 'strong' },
      { tag: 'em' },
    ]

    items.forEach((item, i) => {
      cy.get('.tiptap').type('{selectall}{backspace}/')
      cy.get('.tippy-content .dropdown-menu').should('exist')
      cy.get('.tippy-content .dropdown-menu button').eq(i).click()
      cy.get('.tiptap').type(`I am a ${item.tag}`)
      cy.get(`.tiptap ${item.tag}`).should('exist').should('have.text', `I am a ${item.tag}`)
    })
  })

  it('should close the popup without any command via esc', () => {
    cy.get('.tiptap').type('{selectall}{backspace}/')
    cy.get('.tippy-content .dropdown-menu').should('exist')
    cy.get('.tiptap').type('{esc}')
    cy.get('.tippy-content .dropdown-menu').should('not.exist')
  })

  it('should open the popup when the cursor is after a slash', () => {
    cy.get('.tiptap').type('{selectall}{backspace}/')
    cy.get('.tippy-content .dropdown-menu').should('exist')
    cy.get('.tiptap').type('{leftArrow}')
    cy.get('.tippy-content .dropdown-menu').should('not.exist')
    cy.get('.tiptap').type('{rightArrow}')
    cy.get('.tippy-content .dropdown-menu').should('exist')
  })
})
