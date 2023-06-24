context('/src/Examples/Default/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Default/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Example Text</h1>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should apply the paragraph style when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap h1').should('exist')
    cy.get('.tiptap p').should('not.exist')

    cy.get('.tiptap')
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
    it(`should disable ${m.label} when the code tag is enabled for cursor`, () => {
      cy.get('.tiptap').type('{selectall}Hello world')
      cy.get('button').contains('code').click()
      cy.get('button').contains(m.label).should('be.disabled')
    })

    it(`should enable ${m.label} when the code tag is disabled for cursor`, () => {
      cy.get('.tiptap').type('{selectall}Hello world')
      cy.get('button').contains('code').click()
      cy.get('button').contains('code').click()
      cy.get('button').contains(m.label).should('not.be.disabled')
    })

    it(`should disable ${m.label} when the code tag is enabled for selection`, () => {
      cy.get('.tiptap').type('{selectall}Hello world{selectall}')
      cy.get('button').contains('code').click()
      cy.get('button').contains(m.label).should('be.disabled')
    })

    it(`should enable ${m.label} when the code tag is disabled for selection`, () => {
      cy.get('.tiptap').type('{selectall}Hello world{selectall}')
      cy.get('button').contains('code').click()
      cy.get('button').contains('code').click()
      cy.get('button').contains(m.label).should('not.be.disabled')
    })

    it(`should apply ${m.label} when the button is pressed`, () => {
      cy.get('.tiptap').type('{selectall}Hello world')
      cy.get('button').contains('paragraph').click()
      cy.get('.tiptap').type('{selectall}')
      cy.get('button').contains(m.label).click()
      cy.get(`.tiptap ${m.tag}`).should('exist').should('have.text', 'Hello world')
    })
  })

  it('should clear marks when the button is pressed', () => {
    cy.get('.tiptap').type('{selectall}Hello world')
    cy.get('button').contains('paragraph').click()
    cy.get('.tiptap').type('{selectall}')
    cy.get('button').contains('bold').click()
    cy.get('.tiptap strong').should('exist').should('have.text', 'Hello world')
    cy.get('button').contains('clear marks').click()
    cy.get('.tiptap strong').should('not.exist')
  })

  it('should clear nodes when the button is pressed', () => {
    cy.get('.tiptap').type('{selectall}Hello world')
    cy.get('button').contains('bullet list').click()
    cy.get('.tiptap ul').should('exist').should('have.text', 'Hello world')
    cy.get('.tiptap').type('{enter}A second item{enter}A third item{selectall}')
    cy.get('button').contains('clear nodes').click()
    cy.get('.tiptap ul').should('not.exist')
    cy.get('.tiptap p').should('have.length', 3)
  })

  const listNodes = [
    { label: 'bullet list', tag: 'ul', extensionName: 'bulletList' },
    { label: 'ordered list', tag: 'ol', extensionName: 'orderedList' },
  ]

  const buttonNodes = [
    ...listNodes,
    { label: 'h1', tag: 'h1' },
    { label: 'h2', tag: 'h2' },
    { label: 'h3', tag: 'h3' },
    { label: 'h4', tag: 'h4' },
    { label: 'h5', tag: 'h5' },
    { label: 'h6', tag: 'h6' },
    { label: 'code block', tag: 'pre code' },
    { label: 'blockquote', tag: 'blockquote' },
  ]

  buttonNodes.forEach(n => {
    it(`should set ${n.label} when the button is pressed`, () => {
      cy.get('button').contains('paragraph').click()
      cy.get('.tiptap').type('{selectall}Hello world{selectall}')

      cy.get('button').contains(n.label).click()
      cy.get(`.tiptap ${n.tag}`).should('exist').should('have.text', 'Hello world')
      cy.get('button').contains(n.label).click()
      cy.get(`.tiptap ${n.tag}`).should('not.exist')
    })
  })

  it('should add a hr when on the same line as a node', () => {
    cy.get('.tiptap').type('{rightArrow}')
    cy.get('button').contains('horizontal rule').click()
    cy.get('.tiptap hr').should('exist')
    cy.get('.tiptap h1').should('exist')
  })

  it('should add a hr when on a new line', () => {
    cy.get('.tiptap').type('{rightArrow}{enter}')
    cy.get('button').contains('horizontal rule').click()
    cy.get('.tiptap hr').should('exist')
    cy.get('.tiptap h1').should('exist')
  })

  it('should add a br', () => {
    cy.get('.tiptap').type('{rightArrow}')
    cy.get('button').contains('hard break').click()
    cy.get('.tiptap h1 br').should('exist')
  })

  it('should undo', () => {
    cy.get('.tiptap').type('{selectall}{backspace}')
    cy.get('button').contains('undo').click()
    cy.get('.tiptap').should('contain', 'Hello world')
  })

  it('should redo', () => {
    cy.get('.tiptap').type('{selectall}{backspace}')
    cy.get('button').contains('undo').click()
    cy.get('.tiptap').should('contain', 'Hello world')
    cy.get('button').contains('redo').click()
    cy.get('.tiptap').should('not.contain', 'Hello world')
  })

  describe('Preserve Marks', () => {
    buttonNodes.forEach(node => {
      it(`should preserve marks when enabling ${node.label}`, () => {
        cy.get('.tiptap').type('{selectall}{backspace}')
        buttonMarks.forEach(mark => {
          cy.get('button').contains(mark.label).click()
        })
        cy.get('button').contains(node.label).click()
        buttonMarks.forEach(mark => {
          cy.get('button').contains(mark.label).should('have.class', 'is-active')
        })
      })

      it(`should preserve marks when disabling ${node.label}`, () => {
        cy.get('.tiptap').type('{selectall}{backspace}')
        buttonMarks.forEach(mark => {
          cy.get('button').contains(mark.label).click()
        })
        cy.get('button').contains('paragraph').click()
        buttonMarks.forEach(mark => {
          cy.get('button').contains(mark.label).should('have.class', 'is-active')
        })
      })
    })

    listNodes.forEach(listNode => {
      it(`should preserve marks when lifting ${listNode.label}`, () => {
        cy.get('.tiptap').type('{selectall}{backspace}')
        buttonMarks.forEach(mark => {
          cy.get('button').contains(mark.label).click()
        })
        cy.get('button').contains(listNode.label).click()
        cy.get('.tiptap').type('{enter}')
        buttonMarks.forEach(mark => {
          cy.get('button').contains(mark.label).should('have.class', 'is-active')
        })
      })

      it(`should preserve marks when splitting ${listNode.label}`, () => {
        cy.get('.tiptap').type('{selectall}{backspace}')
        buttonMarks.forEach(mark => {
          cy.get('button').contains(mark.label).click()
        })
        cy.get('button').contains(listNode.label).click()
        cy.get('.tiptap').type(' {enter} {enter}{upArrow}')
        cy.get('.tiptap').then(([{ editor }]) => {
          editor.commands.lift(listNode.extensionName)
        })
        buttonMarks.forEach(mark => {
          cy.get('button').contains(mark.label).should('have.class', 'is-active')
        })
      })
    })
  })
})
