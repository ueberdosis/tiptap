context('/src/Examples/Tasks/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Tasks/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should always use task items', () => {
    cy.get('.ProseMirror input[type="checkbox"]').should('have.length', 1)
  })

  it('should create new tasks', () => {
    cy.get('.ProseMirror').type('Cook food{enter}Eat food{enter}Clean dishes')
    cy.get('.ProseMirror input[type="checkbox"]').should('have.length', 3)
  })

  it('should check and uncheck tasks on click', () => {
    cy.get('.ProseMirror').type('Cook food{enter}Eat food{enter}Clean dishes')
    cy.get('.ProseMirror').find('input[type="checkbox"]').eq(0).click({ force: true })
    cy.get('.ProseMirror').find('input[type="checkbox"]:checked').should('have.length', 1)
    cy.get('.ProseMirror').find('input[type="checkbox"]').eq(1).click({ force: true })
    cy.get('.ProseMirror').find('input[type="checkbox"]:checked').should('have.length', 2)
    cy.get('.ProseMirror').find('input[type="checkbox"]').eq(0).click({ force: true })
    cy.get('.ProseMirror').find('input[type="checkbox"]:checked').should('have.length', 1)
    cy.get('.ProseMirror').find('input[type="checkbox"]').eq(1).click({ force: true })
    cy.get('.ProseMirror').find('input[type="checkbox"]:checked').should('have.length', 0)
  })
})
