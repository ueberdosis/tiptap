context('/src/Experiments/Commands/Vue/', () => {
  before(() => {
    cy.visit('/src/Experiments/Commands/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
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
      cy.get('.ProseMirror').type('{selectall}{backspace}/')
      cy.get('.tippy-content .items').should('exist')
      cy.get('.tippy-content .items .item').eq(i).click()
      cy.get('.ProseMirror').type(`I am a ${item.tag}`)
      cy.get(`.ProseMirror ${item.tag}`).should('exist').should('have.text', `I am a ${item.tag}`)
    })
  })

  it('should close the popup without any command via esc', () => {
    cy.get('.ProseMirror').type('{selectall}{backspace}/')
    cy.get('.tippy-content .items').should('exist')
    cy.get('.ProseMirror').type('{esc}')
    cy.get('.tippy-content .items').should('not.exist')
  })

  it('should open the popup when the cursor is after a slash', () => {
    cy.get('.ProseMirror').type('{selectall}{backspace}/')
    cy.get('.tippy-content .items').should('exist')
    cy.get('.ProseMirror').type('{leftArrow}')
    cy.get('.tippy-content .items').should('not.exist')
    cy.get('.ProseMirror').type('{rightArrow}')
    cy.get('.tippy-content .items').should('exist')
  })
})
