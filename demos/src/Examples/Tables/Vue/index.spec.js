context('/src/Examples/Tables/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Tables/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
      cy.get('button').contains('insertTable').click()
    })
  })

  it('adds a table with three columns and three rows', () => {
    cy.get('.ProseMirror table')
      .should('exist')

    cy.get('.ProseMirror table tr')
      .should('exist')
      .should('have.length', 3)

    cy.get('.ProseMirror table th')
      .should('exist')
      .should('have.length', 3)

    cy.get('.ProseMirror table td')
      .should('exist')
      .should('have.length', 6)
  })

  it('adds & delete columns', () => {
    cy.get('button').contains('addColumnBefore').click()
    cy.get('.ProseMirror table th')
      .should('have.length', 4)

    cy.get('button').contains('addColumnAfter').click()
    cy.get('.ProseMirror table th')
      .should('have.length', 5)

    cy.get('button').contains('deleteColumn')
      .click()
      .click()
    cy.get('.ProseMirror table th')
      .should('have.length', 3)
  })

  it('adds & delete rows', () => {
    cy.get('button').contains('addRowBefore').click()
    cy.get('.ProseMirror table tr')
      .should('have.length', 4)

    cy.get('button').contains('addRowAfter').click()
    cy.get('.ProseMirror table tr')
      .should('have.length', 5)

    cy.get('button').contains('deleteRow')
      .click()
      .click()
    cy.get('.ProseMirror table tr')
      .should('have.length', 3)
  })

  it('should delete table', () => {
    cy.get('button').contains('deleteTable').click()
    cy.get('.ProseMirror table').should('not.exist')
  })

  it('should merge cells', () => {
    cy.get('.ProseMirror').type('{shift}{rightArrow}')
    cy.get('button').contains('mergeCells').click()
    cy.get('.ProseMirror table th').should('have.length', 2)
  })

  it('should split cells', () => {
    cy.get('.ProseMirror').type('{shift}{rightArrow}')
    cy.get('button').contains('mergeCells').click()
    cy.get('.ProseMirror table th').should('have.length', 2)
    cy.get('button').contains('splitCell').click()
    cy.get('.ProseMirror table th').should('have.length', 3)
  })

  it('should toggle header columns', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.toggleHeaderColumn()
      cy.get('.ProseMirror table th').should('have.length', 5)
    })
  })

  it('should toggle header row', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.toggleHeaderRow()
      cy.get('.ProseMirror table th').should('have.length', 0)
    })
  })

  it('should merge split', () => {
    cy.get('.ProseMirror').type('{shift}{rightArrow}')
    cy.get('button').contains('mergeCells').click()
    cy.get('.ProseMirror th[colspan="2"]')
      .should('exist')
    cy.get('button')
      .contains('mergeOrSplit')
      .click()
    cy.get('.ProseMirror th[colspan="2"]')
      .should('not.exist')
  })

  it('should set cell attribute', () => {
    cy.get('.ProseMirror').type('{downArrow}')
    cy.get('button').contains('setCellAttribute').click()
    cy.get('.ProseMirror table td[style]').should('have.attr', 'style', 'background-color: #FAF594')
  })

  it('should move focus to next or prev cell', () => {
    cy.get('.ProseMirror').type('Column 1')
    cy.get('button').contains('goToNextCell').click()
    cy.get('.ProseMirror').type('Column 2')
    cy.get('button').contains('goToPreviousCell').click()

    cy.get('.ProseMirror th').then(elements => {
      expect(elements[0].innerText).to.equal('Column 1')
      expect(elements[1].innerText).to.equal('Column 2')
    })
  })
})
