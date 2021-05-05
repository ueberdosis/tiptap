context('/demos/Marks/Link', () => {
  before(() => {
    cy.visit('/demos/Marks/Link')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should parse a tags correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="#">Example Text</a></p>')
      expect(editor.getHTML()).to.eq('<p><a target="_blank" rel="noopener noreferrer nofollow" href="#">Example Text</a></p>')
    })
  })

  it('should parse a tags with target attribute correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="#" target="_self">Example Text</a></p>')
      expect(editor.getHTML()).to.eq('<p><a target="_self" rel="noopener noreferrer nofollow" href="#">Example Text</a></p>')
    })
  })

  it('should parse a tags with rel attribute correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="#" rel="follow">Example Text</a></p>')
      expect(editor.getHTML()).to.eq('<p><a target="_blank" rel="noopener noreferrer nofollow" href="#">Example Text</a></p>')
    })
  })

  it('the button should add a link to the selected text', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('https://tiptap.dev')

      cy.get('button:first')
        .click()

      cy.window().its('prompt').should('be.called')

      cy.get('.ProseMirror')
        .find('a')
        .should('contain', 'Example Text')
        .should('have.attr', 'href', 'https://tiptap.dev')
    })
  })

  it('detects a pasted URL within a text', () => {
    cy.get('.ProseMirror').paste({ pastePayload: 'some text https://example.com around an url', pasteType: 'text/plain' })
      .find('a')
      .should('contain', 'https://example.com')
      .should('have.attr', 'href', 'https://example.com')
  })

  it('detects a pasted URL', () => {
    cy.get('.ProseMirror').paste({ pastePayload: 'https://example.com', pasteType: 'text/plain' })
      .find('a')
      .should('contain', 'Example Text')
      .should('have.attr', 'href', 'https://example.com')
  })

  it('correctly detects multiple pasted URLs', () => {
    cy.get('.ProseMirror').paste({ pastePayload: 'https://example1.com, https://example2.com/foobar, (http://example3.com/foobar)', pasteType: 'text/plain' })

    cy.get('.ProseMirror').find('a[href="https://example1.com"]')
      .should('contain', 'https://example1.com')

    cy.get('.ProseMirror').find('a[href="https://example2.com/foobar"]')
      .should('contain', 'https://example2.com/foobar')

    cy.get('.ProseMirror').find('a[href="http://example3.com/foobar"]')
      .should('contain', 'http://example3.com/foobar')
  })
})
