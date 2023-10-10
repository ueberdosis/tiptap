context('/src/Examples/Formatting/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Formatting/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  const marks = [
    { label: 'highlight', mark: 'mark' },
  ]

  marks.forEach(m => {
    it(`sets ${m.label}`, () => {
      cy.get('.tiptap').type('Hello world.{selectall}')
      cy.get('button').contains(m.label).click()
      cy.get('.tiptap mark').should('exist')
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
      cy.get('.tiptap').type('Hello world.{selectall}')
      cy.get('button').contains(a.label).click()
      if (a.alignment !== 'left') {
        cy.get('.tiptap p').should('have.css', 'text-align', a.alignment)
      }
    })
  })
})
