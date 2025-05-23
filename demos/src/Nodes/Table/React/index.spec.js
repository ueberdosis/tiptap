context('/src/Nodes/Table/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Nodes/Table/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('creates a table (1x1)', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })

      cy.get('.tiptap').find('td').its('length').should('eq', 1)
      cy.get('.tiptap').find('tr').its('length').should('eq', 1)
    })
  })

  it('creates a table (3x1)', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false })

      cy.get('.tiptap').find('td').its('length').should('eq', 3)
      cy.get('.tiptap').find('tr').its('length').should('eq', 1)
    })
  })

  it('creates a table (1x3)', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: false })

      cy.get('.tiptap').find('td').its('length').should('eq', 3)
      cy.get('.tiptap').find('tr').its('length').should('eq', 3)
    })
  })

  it('creates a table with header row (1x3)', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: true })

      cy.get('.tiptap').find('th').its('length').should('eq', 1)
      cy.get('.tiptap').find('td').its('length').should('eq', 2)
      cy.get('.tiptap').find('tr').its('length').should('eq', 3)
    })
  })

  it('creates a table with correct defaults (3x3, th)', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertTable()

      cy.get('.tiptap').find('th').its('length').should('eq', 3)
      cy.get('.tiptap').find('td').its('length').should('eq', 6)
      cy.get('.tiptap').find('tr').its('length').should('eq', 3)
    })
  })

  it('sets the minimum width on the colgroups by default (3x1)', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false })

      cy.get('.tiptap').find('col').invoke('attr', 'style').should('eq', 'min-width: 25px;')
    })
  })

  it('generates correct markup for a table (1x1)', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })

      const html = editor.getHTML()

      expect(html).to.equal(
        '<table style="min-width: 25px"><colgroup><col style="min-width: 25px"></colgroup><tbody><tr><td colspan="1" rowspan="1"><p></p></td></tr></tbody></table>',
      )
    })
  })

  it('generates correct markup for a table (1x1, th)', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: true })

      const html = editor.getHTML()

      expect(html).to.equal(
        '<table style="min-width: 25px"><colgroup><col style="min-width: 25px"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p></p></th></tr></tbody></table>',
      )
    })
  })
})
