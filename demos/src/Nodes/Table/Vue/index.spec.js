context('/src/Nodes/Table/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/Table/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('creates a table (1x1)', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })

      cy.get('.ProseMirror').find('td').its('length').should('eq', 1)
      cy.get('.ProseMirror').find('tr').its('length').should('eq', 1)
    })
  })

  it('creates a table (3x1)', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false })

      cy.get('.ProseMirror').find('td').its('length').should('eq', 3)
      cy.get('.ProseMirror').find('tr').its('length').should('eq', 1)
    })
  })

  it('creates a table (1x3)', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: false })

      cy.get('.ProseMirror').find('td').its('length').should('eq', 3)
      cy.get('.ProseMirror').find('tr').its('length').should('eq', 3)
    })
  })

  it('creates a table with header row (1x3)', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: true })

      cy.get('.ProseMirror').find('th').its('length').should('eq', 1)
      cy.get('.ProseMirror').find('td').its('length').should('eq', 2)
      cy.get('.ProseMirror').find('tr').its('length').should('eq', 3)
    })
  })

  it('creates a table with correct defaults (3x3, th)', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.insertTable()

      cy.get('.ProseMirror').find('th').its('length').should('eq', 3)
      cy.get('.ProseMirror').find('td').its('length').should('eq', 6)
      cy.get('.ProseMirror').find('tr').its('length').should('eq', 3)
    })
  })

  it('generates correct markup for a table (1x1)', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })

      const html = editor.getHTML()

      expect(html).to.equal('<table><tbody><tr><td colspan="1" rowspan="1"><p></p></td></tr></tbody></table>')
    })
  })

  it('generates correct markup for a table (1x1, th)', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: true })

      const html = editor.getHTML()

      expect(html).to.equal('<table><tbody><tr><th colspan="1" rowspan="1"><p></p></th></tr></tbody></table>')
    })
  })

})
