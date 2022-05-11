context('/src/Examples/Default/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Default/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Example Text</h1>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should apply the paragraph style when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror h1').should('exist')
    cy.get('.ProseMirror p').should('not.exist')

    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, altKey: true, key: '0' })
      .find('p')
      .should('contain', 'Example Text')
  })

  const buttonMarks = [
    { label: 'bold', tag: 'strong' },
    { label: 'italic', tag: 'em' },
    { label: 'strike', tag: 's' },
  ]

  buttonMarks.forEach(m => {
    it(`should apply ${m.label} when the button is pressed`, () => {
      cy.get('.ProseMirror').type('{selectall}Hello world')
      cy.get('button').contains('paragraph').click()
      cy.get('.ProseMirror').type('{selectall}')
      cy.get('button').contains(m.label).click()
      cy.get(`.ProseMirror ${m.tag}`).should('exist').should('have.text', 'Hello world')
    })
  })

  it('should clear marks when the button is pressed', () => {
    cy.get('.ProseMirror').type('{selectall}Hello world')
    cy.get('button').contains('paragraph').click()
    cy.get('.ProseMirror').type('{selectall}')
    cy.get('button').contains('bold').click()
    cy.get('.ProseMirror strong').should('exist').should('have.text', 'Hello world')
    cy.get('button').contains('clear marks').click()
    cy.get('.ProseMirror strong').should('not.exist')
  })

  it('should clear nodes when the button is pressed', () => {
    cy.get('.ProseMirror').type('{selectall}Hello world')
    cy.get('button').contains('bullet list').click()
    cy.get('.ProseMirror ul').should('exist').should('have.text', 'Hello world')
    cy.get('.ProseMirror').type('{enter}A second item{enter}A third item{selectall}')
    cy.get('button').contains('clear nodes').click()
    cy.get('.ProseMirror ul').should('not.exist')
    cy.get('.ProseMirror p').should('have.length', 3)
  })

  const buttonNodes = [
    { label: 'h1', tag: 'h1' },
    { label: 'h2', tag: 'h2' },
    { label: 'h3', tag: 'h3' },
    { label: 'h4', tag: 'h4' },
    { label: 'h5', tag: 'h5' },
    { label: 'h6', tag: 'h6' },
    { label: 'bullet list', tag: 'ul' },
    { label: 'ordered list', tag: 'ol' },
    { label: 'code block', tag: 'pre code' },
    { label: 'blockquote', tag: 'blockquote' },
  ]

  buttonNodes.forEach(n => {
    it(`should set ${n.label} when the button is pressed`, () => {
      cy.get('button').contains('paragraph').click()
      cy.get('.ProseMirror').type('{selectall}Hello world{selectall}')

      cy.get('button').contains(n.label).click()
      cy.get(`.ProseMirror ${n.tag}`).should('exist').should('have.text', 'Hello world')
      cy.get('button').contains(n.label).click()
      cy.get(`.ProseMirror ${n.tag}`).should('not.exist')
    })
  })

  it('should add a hr when on the same line as a node', () => {
    cy.get('.ProseMirror').type('{rightArrow}')
    cy.get('button').contains('horizontal rule').click()
    cy.get('.ProseMirror hr').should('exist')
    cy.get('.ProseMirror h1').should('exist')
  })

  it('should add a hr when on a new line', () => {
    cy.get('.ProseMirror').type('{rightArrow}{enter}')
    cy.get('button').contains('horizontal rule').click()
    cy.get('.ProseMirror hr').should('exist')
    cy.get('.ProseMirror h1').should('exist')
  })

  it('should add a br', () => {
    cy.get('.ProseMirror').type('{rightArrow}')
    cy.get('button').contains('hard break').click()
    cy.get('.ProseMirror h1 br').should('exist')
  })

  it('should undo', () => {
    cy.get('.ProseMirror').type('{selectall}{backspace}')
    cy.get('button').contains('undo').click()
    cy.get('.ProseMirror').should('contain', 'Hello world')
  })

  it('should redo', () => {
    cy.get('.ProseMirror').type('{selectall}{backspace}')
    cy.get('button').contains('undo').click()
    cy.get('.ProseMirror').should('contain', 'Hello world')
    cy.get('button').contains('redo').click()
    cy.get('.ProseMirror').should('not.contain', 'Hello world')
  })
})
