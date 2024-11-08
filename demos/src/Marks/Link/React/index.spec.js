context('/src/Marks/Link/React/', () => {
  before(() => {
    cy.visit('/src/Marks/Link/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example TextDEFAULT</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should parse a tags correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="https://example.com">Example Text1</a></p>')
      expect(editor.getHTML()).to.eq(
        '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">Example Text1</a></p>',
      )
    })
  })

  it('should parse a tags with target attribute correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="https://example.com" target="_self">Example Text2</a></p>')
      expect(editor.getHTML()).to.eq(
        '<p><a target="_self" rel="noopener noreferrer nofollow" href="https://example.com">Example Text2</a></p>',
      )
    })
  })

  it('should parse a tags with rel attribute correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="https://example.com" rel="follow">Example Text3</a></p>')
      expect(editor.getHTML()).to.eq(
        '<p><a target="_blank" rel="follow" href="https://example.com">Example Text3</a></p>',
      )
    })
  })

  it('the button should add a link to the selected text', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('https://tiptap.dev')

      cy.get('button:first').click()

      cy.window().its('prompt').should('be.called')

      cy.get('.tiptap')
        .find('a')
        .should('contain', 'Example TextDEFAULT')
        .should('have.attr', 'href', 'https://tiptap.dev')
    })
  })

  it('should allow exiting the link once set', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="https://example.com" target="_self">Example Text2</a></p>')
      cy.get('.tiptap').type('{rightArrow}')

      cy.get('button:first').should('not.have.class', 'is-active')
    })
  })

  it('detects autolinking', () => {
    cy.get('.tiptap').type('https://example.com ').find('a').should('contain', 'https://example.com')
      .should('have.attr', 'href', 'https://example.com')
  })

  it('detects autolinking with numbers', () => {
    cy.get('.tiptap').type('https://tiptap4u.com ').find('a').should('contain', 'https://tiptap4u.com')
      .should('have.attr', 'href', 'https://tiptap4u.com')
  })

  it('uses the default protocol', () => {
    cy.get('.tiptap').type('example.com ').find('a').should('contain', 'example.com')
      .should('have.attr', 'href', 'https://example.com')
  })

  it('uses a non-default protocol if present', () => {
    cy.get('.tiptap').type('http://example.com ').find('a').should('contain', 'http://example.com')
      .should('have.attr', 'href', 'http://example.com')
  })

  it('detects a pasted URL within a text', () => {
    cy.get('.tiptap')
      .paste({
        pastePayload: 'some text https://example1.com around an url',
        pasteType: 'text/plain',
      })
      .find('a')
      .should('contain', 'https://example1.com')
      .should('have.attr', 'href', 'https://example1.com')
  })

  it('detects a pasted URL', () => {
    cy.get('.tiptap')
      .type('{backspace}')
      .paste({ pastePayload: 'https://example2.com', pasteType: 'text/plain' })
      .find('a')
      .should('contain', 'https://example2.com')
      .should('have.attr', 'href', 'https://example2.com')
  })

  it('detects a pasted URL with query params', () => {
    cy.get('.tiptap')
      .type('{backspace}')
      .paste({ pastePayload: 'https://example.com?paramA=nice&paramB=cool', pasteType: 'text/plain' })
      .find('a')
      .should('contain', 'https://example.com?paramA=nice&paramB=cool')
      .should('have.attr', 'href', 'https://example.com?paramA=nice&paramB=cool')
  })

  it('correctly detects multiple pasted URLs', () => {
    cy.get('.tiptap').paste({
      pastePayload:
        'https://example1.com, https://example2.com/foobar, (http://example3.com/foobar)',
      pasteType: 'text/plain',
    })

    cy.get('.tiptap')
      .find('a[href="https://example1.com"]')
      .should('contain', 'https://example1.com')

    cy.get('.tiptap')
      .find('a[href="https://example2.com/foobar"]')
      .should('contain', 'https://example2.com/foobar')

    cy.get('.tiptap')
      .find('a[href="http://example3.com/foobar"]')
      .should('contain', 'http://example3.com/foobar')
  })

  it('should not allow links with disallowed protocols', () => {
    const disallowedProtocols = ['ftp://example.com', 'file:///example.txt', 'mailto:test@example.com']

    disallowedProtocols.forEach(url => {
      cy.get('.tiptap').then(([{ editor }]) => {
        editor.commands.setContent(`<p><a href="${url}">Example Text</a></p>`)
        expect(editor.getHTML()).to.not.include(url)
      })
    })
  })

  it('should not allow links with disallowed domains', () => {
    const disallowedDomains = ['https://example-phishing.com', 'https://malicious-site.net']

    disallowedDomains.forEach(url => {
      cy.get('.tiptap').then(([{ editor }]) => {
        editor.commands.setContent(`<p><a href="${url}">Example Text</a></p>`)
        expect(editor.getHTML()).to.not.include(url)
      })
    })
  })

  it('should not auto-link a URL from a disallowed domain', () => {
    cy.get('.tiptap').type('https://example-phishing.com ') // disallowed domain
    cy.get('.tiptap').should('not.have.descendants', 'a')
    cy.get('.tiptap').should('contain.text', 'https://example-phishing.com')
  })
})
