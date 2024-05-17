context('/src/Examples/Tasks/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Tasks/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should always use task items', () => {
    cy.get('.tiptap input[type="checkbox"]').should('have.length', 1)
  })

  it('should create new tasks', () => {
    cy.get('.tiptap').type('Cook food{enter}Eat food{enter}Clean dishes')
    cy.get('.tiptap input[type="checkbox"]').should('have.length', 3)
  })

  it('should check and uncheck tasks on click', () => {
    cy.get('.tiptap').type('Cook food{enter}Eat food{enter}Clean dishes')
    cy.get('.tiptap').find('input[type="checkbox"]').eq(0).click({ force: true })
    cy.get('.tiptap').find('input[type="checkbox"]:checked').should('have.length', 1)
    cy.get('.tiptap').find('input[type="checkbox"]').eq(1).click({ force: true })
    cy.get('.tiptap').find('input[type="checkbox"]:checked').should('have.length', 2)
    cy.get('.tiptap').find('input[type="checkbox"]').eq(0).click({ force: true })
    cy.get('.tiptap').find('input[type="checkbox"]:checked').should('have.length', 1)
    cy.get('.tiptap').find('input[type="checkbox"]').eq(1).click({ force: true })
    cy.get('.tiptap').find('input[type="checkbox"]:checked').should('have.length', 0)
  })
})
