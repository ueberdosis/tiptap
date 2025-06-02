context('/src/Nodes/CodeBlock/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/CodeBlock/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should parse code blocks correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<pre><code>Example Text</code></pre>')
      expect(editor.getHTML()).to.eq('<pre><code>Example Text</code></pre>')
    })
  })

  it('should parse code blocks with language correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<pre><code class="language-css">Example Text</code></pre>')
      expect(editor.getHTML()).to.eq('<pre><code class="language-css">Example Text</code></pre>')
    })
  })

  it('the button should make the selected line a code block', () => {
    cy.get('button:first').click()

    cy.get('.tiptap').find('pre').should('contain', 'Example Text')
  })

  it('the button should toggle the code block', () => {
    cy.get('button:first').click()

    cy.get('.tiptap').find('pre').should('contain', 'Example Text')

    cy.get('.tiptap').type('{selectall}')

    cy.get('button:first').click()

    cy.get('.tiptap pre').should('not.exist')
  })

  it('the keyboard shortcut should make the selected line a code block', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, altKey: true, key: 'c' })
      .find('pre')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the code block', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, altKey: true, key: 'c' })
      .find('pre')
      .should('contain', 'Example Text')

    cy.get('.tiptap')
      .type('{selectall}')
      .trigger('keydown', { modKey: true, altKey: true, key: 'c' })

    cy.get('.tiptap pre').should('not.exist')
  })

  it('should parse the language from a HTML code block', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent(
        '<pre><code class="language-css">body { display: none; }</code></pre>',
      )

      cy.get('.tiptap').find('pre>code.language-css').should('have.length', 1)
    })
  })

  it('should make a code block from backtick markdown shortcuts', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap').type('``` Code').find('pre>code').should('contain', 'Code')
    })
  })

  it('should make a code block from tilde markdown shortcuts', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap').type('~~~ Code').find('pre>code').should('contain', 'Code')
    })
  })

  it('should make a code block for js with backticks', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap')
        .type('```js Code')
        .find('pre>code.language-js')
        .should('contain', 'Code')
    })
  })

  it('should make a code block for js with tildes', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap')
        .type('~~~js Code')
        .find('pre>code.language-js')
        .should('contain', 'Code')
    })
  })

  it('should make a code block from backtick markdown shortcuts followed by enter', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap').type('```{enter}Code').find('pre>code').should('contain', 'Code')
    })
  })

  it('reverts the markdown shortcut when pressing backspace', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap').type('``` {backspace}')

      cy.get('.tiptap pre').should('not.exist')
    })
  })

  it('removes the code block when pressing backspace', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap pre').should('not.exist')

      cy.get('.tiptap').type('Paragraph{enter}``` A{backspace}{backspace}')

      cy.get('.tiptap pre').should('not.exist')
    })
  })

  it('removes the code block when pressing backspace, even with blank lines', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap pre').should('not.exist')

      cy.get('.tiptap').type('Paragraph{enter}{enter}``` A{backspace}{backspace}')

      cy.get('.tiptap pre').should('not.exist')
    })
  })

  it('removes the code block when pressing backspace, even at start of document', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap pre').should('not.exist')

      cy.get('.tiptap').type('``` A{leftArrow}{backspace}')

      cy.get('.tiptap pre').should('not.exist')
    })
  })
})
