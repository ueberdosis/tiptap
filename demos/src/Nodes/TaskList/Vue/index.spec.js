context('/src/Nodes/TaskList/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/TaskList/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should parse unordered lists correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><p>Example Text</p></li></ul>')
      expect(editor.getHTML()).to.eq('<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Example Text</p></div></li></ul>')
    })
  })

  it('should parse unordered lists without paragraphs correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<ul data-type="taskList"><li data-checked="false" data-type="taskItem">Example Text</li></ul>')
      expect(editor.getHTML()).to.eq('<ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Example Text</p></div></li></ul>')
    })
  })

  it('the button should make the selected line a task list item', () => {
    cy.get('.tiptap ul')
      .should('not.exist')

    cy.get('.tiptap ul li')
      .should('not.exist')

    cy.get('button:nth-child(1)')
      .click()

    cy.get('.tiptap')
      .find('ul[data-type="taskList"]')
      .should('contain', 'Example Text')

    cy.get('.tiptap')
      .find('ul[data-type="taskList"] li')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the task list', () => {
    cy.get('.tiptap ul')
      .should('not.exist')

    cy.get('button:nth-child(1)')
      .click()

    cy.get('.tiptap')
      .find('ul[data-type="taskList"]')
      .should('contain', 'Example Text')

    cy.get('button:nth-child(1)')
      .click()

    cy.get('.tiptap ul')
      .should('not.exist')
  })

  it('should make the paragraph a task list when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, shiftKey: true, key: '9' })
      .find('ul li')
      .should('contain', 'Example Text')
  })

  it('should leave the list with double enter', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap')
      .type('[ ] List Item 1{enter}{enter}Paragraph')

    cy.get('.tiptap')
      .find('li')
      .its('length')
      .should('eq', 1)

    cy.get('.tiptap')
      .find('p')
      .should('contain', 'Paragraph')
  })

  it('should make a task list from square brackets', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap')
      .type('[ ] List Item 1{enter}List Item 2')

    cy.get('.tiptap')
      .find('li:nth-child(1)')
      .should('contain', 'List Item 1')
      .should('have.attr', 'data-checked', 'false')

    cy.get('.tiptap')
      .find('li:nth-child(2)')
      .should('contain', 'List Item 2')
      .should('have.attr', 'data-checked', 'false')
  })

  it('should make a task list from checked square brackets', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap')
      .type('[x] List Item 1{enter}List Item 2')

    cy.get('.tiptap')
      .find('li:nth-child(1)')
      .should('contain', 'List Item 1')
      .should('have.attr', 'data-checked', 'true')

    cy.get('.tiptap')
      .find('li:nth-child(2)')
      .should('contain', 'List Item 2')
      .should('have.attr', 'data-checked', 'false')
  })
})
