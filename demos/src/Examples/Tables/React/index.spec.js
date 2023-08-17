context('/src/Examples/Tables/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Tables/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
      cy.get('button').contains('insertTable').click()
    })
  })

  it('adds a table with three columns and three rows', () => {
    cy.get('.tiptap table')
      .should('exist')

    cy.get('.tiptap table tr')
      .should('exist')
      .should('have.length', 3)

    cy.get('.tiptap table th')
      .should('exist')
      .should('have.length', 3)

    cy.get('.tiptap table td')
      .should('exist')
      .should('have.length', 6)
  })

  it('adds & delete columns', () => {
    cy.get('button').contains('addColumnBefore').click()
    cy.get('.tiptap table th')
      .should('have.length', 4)

    cy.get('button').contains('addColumnAfter').click()
    cy.get('.tiptap table th')
      .should('have.length', 5)

    cy.get('button').contains('deleteColumn')
      .click()
      .click()
    cy.get('.tiptap table th')
      .should('have.length', 3)
  })

  it('adds & delete rows', () => {
    cy.get('button').contains('addRowBefore').click()
    cy.get('.tiptap table tr')
      .should('have.length', 4)

    cy.get('button').contains('addRowAfter').click()
    cy.get('.tiptap table tr')
      .should('have.length', 5)

    cy.get('button').contains('deleteRow')
      .click()
      .click()
    cy.get('.tiptap table tr')
      .should('have.length', 3)
  })

  it('should delete table', () => {
    cy.get('button').contains('deleteTable').click()
    cy.get('.tiptap table').should('not.exist')
  })

  it('should merge cells', () => {
    cy.get('.tiptap').type('{shift}{rightArrow}')
    cy.get('button').contains('mergeCells').click()
    cy.get('.tiptap table th').should('have.length', 2)
  })

  it('should split cells', () => {
    cy.get('.tiptap').type('{shift}{rightArrow}')
    cy.get('button').contains('mergeCells').click()
    cy.get('.tiptap table th').should('have.length', 2)
    cy.get('button').contains('splitCell').click()
    cy.get('.tiptap table th').should('have.length', 3)
  })

  it('should toggle header columns', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.toggleHeaderColumn()
      cy.get('.tiptap table th').should('have.length', 5)
    })
  })

  it('should toggle header row', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.toggleHeaderRow()
      cy.get('.tiptap table th').should('have.length', 0)
    })
  })

  it('should merge split', () => {
    cy.get('.tiptap').type('{shift}{rightArrow}')
    cy.get('button').contains('mergeCells').click()
    cy.get('.tiptap th[colspan="2"]')
      .should('exist')
    cy.get('button')
      .contains('mergeOrSplit')
      .click()
    cy.get('.tiptap th[colspan="2"]')
      .should('not.exist')
  })

  it('should set cell attribute', () => {
    cy.get('.tiptap').type('{downArrow}')
    cy.get('button').contains('setCellAttribute').click()
    cy.get('.tiptap table td[style]').should('have.attr', 'style', 'background-color: #FAF594')
  })

  it('should move focus to next or prev cell', () => {
    cy.get('.tiptap').type('Column 1')
    cy.get('button').contains('goToNextCell').click()
    cy.get('.tiptap').type('Column 2')
    cy.get('button').contains('goToPreviousCell').click()

    cy.get('.tiptap th').then(elements => {
      expect(elements[0].innerText).to.equal('Column 1')
      expect(elements[1].innerText).to.equal('Column 2')
    })
  })
})
