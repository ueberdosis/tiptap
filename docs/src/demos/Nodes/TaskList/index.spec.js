context('/demos/Nodes/TaskList', () => {
  before(() => {
    cy.visit('/demos/Nodes/TaskList')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should parse unordered lists correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><p>Example Text</p></li></ul>')
      expect(editor.getHTML()).to.eq('<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><p>Example Text</p></li></ul>')
    })
  })

  it('should parse unordered lists without paragraphs correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<ul data-type="taskList"><li data-checked="false" data-type="taskItem">Example Text</li></ul>')
      expect(editor.getHTML()).to.eq('<ul data-type="taskList"><li data-checked="false" data-type="taskItem"><p>Example Text</p></li></ul>')
    })
  })

  it('the button should make the selected line a task list item', () => {
    cy.get('.ProseMirror ul')
      .should('not.exist')

    cy.get('.ProseMirror ul li')
      .should('not.exist')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror')
      .find('ul[data-type="taskList"]')
      .should('contain', 'Example Text')

    cy.get('.ProseMirror')
      .find('ul[data-type="taskList"] li')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the task list', () => {
    cy.get('.ProseMirror ul')
      .should('not.exist')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror')
      .find('ul[data-type="taskList"]')
      .should('contain', 'Example Text')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror ul')
      .should('not.exist')
  })

  it('should make the paragraph a task list when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'l' })
      .find('ul li')
      .should('contain', 'Example Text')
  })

  it('should leave the list with double enter', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror')
      .type('[ ] List Item 1{enter}{enter}Paragraph')

    cy.get('.ProseMirror')
      .find('li')
      .its('length')
      .should('eq', 1)

    cy.get('.ProseMirror')
      .find('p')
      .should('contain', 'Paragraph')
  })

  it('should make a task list from square brackets', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror')
      .type('[ ] List Item 1{enter}List Item 2')

    cy.get('.ProseMirror')
      .find('li:nth-child(1)')
      .should('contain', 'List Item 1')
      .should('have.attr', 'data-checked', 'false')

    cy.get('.ProseMirror')
      .find('li:nth-child(2)')
      .should('contain', 'List Item 2')
      .should('have.attr', 'data-checked', 'false')
  })

  it('should make a task list from checked square brackets', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror')
      .type('[x] List Item 1{enter}List Item 2')

    cy.get('.ProseMirror')
      .find('li:nth-child(1)')
      .should('contain', 'List Item 1')
      .should('have.attr', 'data-checked', 'true')

    cy.get('.ProseMirror')
      .find('li:nth-child(2)')
      .should('contain', 'List Item 2')
      .should('have.attr', 'data-checked', 'false')
  })
})
