context('/src/Examples/Formatting/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Formatting/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  const marks = [
    { label: 'Highlight', mark: 'mark' },
  ]

  marks.forEach(m => {
    it(`sets ${m.label}`, () => {
      cy.get('.tiptap').type('Hello world.{selectall}')
      cy.get('button').contains(m.label).click()
      cy.get('.tiptap mark').should('exist')
    })
  })

  const alignments = [
    { label: 'Left', alignment: 'left' },
    { label: 'Center', alignment: 'center' },
    { label: 'Right', alignment: 'right' },
    { label: 'Justify', alignment: 'justify' },
  ]

  alignments.forEach(a => {
    it(`sets ${a.label}`, () => {
      cy.get('.tiptap').type('Hello world.{selectall}')
      cy.get('button').contains(a.label).click()
      if (a.alignment !== 'left') {
        cy.get('.tiptap p').should('have.css', 'text-align', a.alignment)
      }
    })
  })
})
