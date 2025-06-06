context('/src/Examples/Default/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Default/React/')

    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Example Text</h1>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should apply the paragraph style when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap h1').should('exist')

    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, altKey: true, key: '0' })
      .find('p')
      .should('contain', 'Example Text')
  })

  const buttonMarks = [
    { label: 'Bold', tag: 'strong' },
    { label: 'Italic', tag: 'em' },
    { label: 'Strike', tag: 's' },
  ]

  it(`should disable bold, italic, strike when the code tag is enabled for cursor`, () => {
    buttonMarks.forEach(m => {
      cy.get('.tiptap').type('{selectall}Hello world')
      cy.get('button').contains('Code').click()
      cy.get('button').contains(m.label).should('be.disabled')
    })
  })

  it(`should enable bold, italic, strike when the code tag is disabled for cursor`, () => {
    buttonMarks.forEach(m => {
      cy.get('.tiptap').type('{selectall}Hello world')
      cy.get('button').contains('Code').click()
      cy.get('button').contains('Code').click()
      cy.get('button').contains(m.label).should('not.be.disabled')
    })
  })

  it(`should disable bold, italic, strike when the code tag is enabled for selection`, () => {
    buttonMarks.forEach(m => {
      cy.get('.tiptap').type('{selectall}{backspace}')
      cy.get('.tiptap').type('{selectall}Hello world{selectall}')
      cy.get('button').contains('Code').click()
      cy.get('button').contains(m.label).should('be.disabled')
    })
  })

  it(`should enable bold, italic, strike when the code tag is disabled for selection`, () => {
    buttonMarks.forEach(m => {
      cy.get('.tiptap').type('{selectall}Hello world{selectall}')
      cy.get('button').contains('Code').click()
      cy.get('button').contains('Code').click()
      cy.get('button').contains(m.label).should('not.be.disabled')
    })
  })

  it(`should apply bold, italic, strike when the button is pressed`, () => {
    buttonMarks.forEach(m => {
      cy.get('.tiptap').type('{selectall}{backspace}')
      cy.get('.tiptap').type('{selectall}Hello world{selectall}')
      cy.get('button').contains('Paragraph').click()
      cy.get('button').contains(m.label).click()
      cy.get(`.tiptap ${m.tag}`).should('exist').should('have.text', 'Hello world')
    })
  })

  it('should clear marks when the button is pressed', () => {
    cy.get('.tiptap').type('{selectall}Hello world')
    cy.get('button').contains('Paragraph').click()
    cy.get('.tiptap').type('{selectall}')
    cy.get('button').contains('Bold').click()
    cy.get('.tiptap strong').should('exist').should('have.text', 'Hello world')
    cy.get('button').contains('Clear marks').click()
    cy.get('.tiptap strong').should('not.exist')
  })

  it('should clear nodes when the button is pressed', () => {
    cy.get('.tiptap').type('{selectall}Hello world')
    cy.get('button').contains('Bullet list').click()
    cy.get('.tiptap ul').should('exist').should('have.text', 'Hello world')
    cy.get('.tiptap').type('{enter}A second item{enter}A third item{selectall}')
    cy.get('button').contains('Clear nodes').click()
    cy.get('.tiptap ul').should('not.exist')
    cy.get('.tiptap p').should('have.length', 4)
  })

  const buttonNodes = [
    { label: 'H1', tag: 'h1' },
    { label: 'H2', tag: 'h2' },
    { label: 'H3', tag: 'h3' },
    { label: 'H4', tag: 'h4' },
    { label: 'H5', tag: 'h5' },
    { label: 'H6', tag: 'h6' },
    { label: 'Bullet list', tag: 'ul' },
    { label: 'Ordered list', tag: 'ol' },
    { label: 'Code block', tag: 'pre code' },
    { label: 'Blockquote', tag: 'blockquote' },
  ]

  it(`should set the correct type when the button is pressed`, () => {
    buttonNodes.forEach(n => {
      cy.get('button').contains('Paragraph').click()
      cy.get('.tiptap').type('{selectall}Hello world{selectall}')

      cy.get('button').contains(n.label).click()
      cy.get(`.tiptap ${n.tag}`).should('exist').should('have.text', 'Hello world')
      cy.get('button').contains(n.label).click()
      cy.get(`.tiptap ${n.tag}`).should('not.exist')
    })
  })

  it('should add a hr when on the same line as a node', () => {
    cy.get('.tiptap').type('{rightArrow}')
    cy.get('button').contains('Horizontal rule').click()
    cy.get('.tiptap hr').should('exist')
    cy.get('.tiptap h1').should('exist')
  })

  it('should add a hr when on a new line', () => {
    cy.get('.tiptap').type('{rightArrow}{enter}')
    cy.get('button').contains('Horizontal rule').click()
    cy.get('.tiptap hr').should('exist')
    cy.get('.tiptap h1').should('exist')
  })

  it('should add a br', () => {
    cy.get('.tiptap').type('{rightArrow}')
    cy.get('button').contains('Hard break').click()
    cy.get('.tiptap br').should('exist')
  })

  it('should undo', () => {
    cy.get('.tiptap')
      .then(([{ editor }]) => {
        editor.commands.setContent('<h1>Example Text</h1>')

        cy.get('.tiptap').type('{selectall}{backspace}')
        return new Promise(resolve => {
          setTimeout(resolve, 500)
        })
      })
      .then(() => {
        cy.get('button').contains('Undo').click()
        cy.get('.tiptap').should('contain', 'Example Text')
      })
  })

  it('should redo', () => {
    cy.get('.tiptap')
      .then(([{ editor }]) => {
        editor.commands.setContent('<h1>Example Text</h1>')

        return new Promise(resolve => {
          setTimeout(resolve, 500)
        })
      })
      .then(() => {
        cy.get('.tiptap').type('{selectall}{backspace}')
        cy.get('button').contains('Undo').click()
        cy.get('.tiptap').should('contain', 'Example Text')
        cy.get('button').contains('Redo').click()
        cy.get('.tiptap').should('not.contain', 'Example Text')
      })
  })
})
