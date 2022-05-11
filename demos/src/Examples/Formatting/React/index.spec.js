context('/src/Examples/Formatting/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Formatting/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').type('{selectall}{backspace}')
  })

  const marks = [
    { label: 'highlight', mark: 'mark' },
  ]

  marks.forEach(m => {
    it(`sets ${m.label}`, () => {
      cy.get('.ProseMirror').type('Hello world.{selectall}')
      cy.get('button').contains(m.label).click()
      cy.get('.ProseMirror mark').should('exist')
    })
  })

  const alignments = [
    { label: 'left', alignment: 'left' },
    { label: 'center', alignment: 'center' },
    { label: 'right', alignment: 'right' },
    { label: 'justify', alignment: 'justify' },
  ]

  alignments.forEach(a => {
    it(`sets ${a.label}`, () => {
      cy.get('.ProseMirror').type('Hello world.{selectall}')
      cy.get('button').contains(a.label).click()
      if (a.alignment !== 'left') {
        cy.get('.ProseMirror p').should('have.css', 'text-align', a.alignment)
      }
    })
  })
})
