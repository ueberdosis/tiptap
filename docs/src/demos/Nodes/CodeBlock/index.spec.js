context('/demos/Nodes/CodeBlock', () => {
  before(() => {
    cy.visit('/demos/Nodes/CodeBlock')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should parse code blocks correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<pre><code>Example Text</code></pre>')
      expect(editor.getHTML()).to.eq('<pre><code>Example Text</code></pre>')
    })
  })

  it('should parse code blocks with language correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<pre><code class="language-css">Example Text</code></pre>')
      expect(editor.getHTML()).to.eq('<pre><code class="language-css">Example Text</code></pre>')
    })
  })

  it('the button should make the selected line a code block', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('pre')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the code block', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('pre')
      .should('contain', 'Example Text')

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror pre')
      .should('not.exist')
  })

  it('the keyboard shortcut should make the selected line a code block', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, altKey: true, key: 'c' })
      .find('pre')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the code block', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, altKey: true, key: 'c' })
      .find('pre')
      .should('contain', 'Example Text')

    cy.get('.ProseMirror')
      .type('{selectall}')
      .trigger('keydown', { modKey: true, altKey: true, key: 'c' })

    cy.get('.ProseMirror pre')
      .should('not.exist')
  })

  it('should parse the language from a HTML code block', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<pre><code class="language-css">body { display: none; }</code></pre>')

      cy.get('.ProseMirror')
        .find('pre>code.language-css')
        .should('have.length', 1)
    })
  })

  it('should make a code block from backtick markdown shortcuts', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.ProseMirror')
        .type('``` Code')
        .find('pre>code')
        .should('contain', 'Code')
    })
  })

  it('should make a code block from tilde markdown shortcuts', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.ProseMirror')
        .type('~~~ Code')
        .find('pre>code')
        .should('contain', 'Code')
    })
  })

  it('should make a code block for js with backticks', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.ProseMirror')
        .type('```js Code')
        .find('pre>code.language-js')
        .should('contain', 'Code')
    })
  })

  it('should make a code block for js with tildes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.ProseMirror')
        .type('~~~js Code')
        .find('pre>code.language-js')
        .should('contain', 'Code')
    })
  })
})
