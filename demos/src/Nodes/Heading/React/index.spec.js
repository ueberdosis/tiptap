context('/src/Nodes/Heading/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/Heading/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  const headings = ['<h1>Example Text</h1>', '<h2>Example Text</h2>', '<h3>Example Text</h3>']

  headings.forEach(html => {
    it(`should parse headings correctly (${html})`, () => {
      cy.get('.tiptap').then(([{ editor }]) => {
        editor.commands.setContent(html)
        expect(editor.getHTML()).to.eq(html)
      })
    })
  })

  it('should omit disabled heading levels', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<h4>Example Text</h4>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('the button should make the selected line a h1', () => {
    cy.get('.tiptap h1').should('not.exist')

    cy.get('button:nth-child(1)').click()

    cy.get('.tiptap').find('h1').should('contain', 'Example Text')
  })

  it('the button should make the selected line a h2', () => {
    cy.get('.tiptap h2').should('not.exist')

    cy.get('button:nth-child(2)').click()

    cy.get('.tiptap').find('h2').should('contain', 'Example Text')
  })

  it('the button should make the selected line a h3', () => {
    cy.get('.tiptap h3').should('not.exist')

    cy.get('button:nth-child(3)').click()

    cy.get('.tiptap').find('h3').should('contain', 'Example Text')
  })

  it('the button should toggle the heading', () => {
    cy.get('.tiptap h1').should('not.exist')

    cy.get('button:nth-child(1)').click()

    cy.get('.tiptap').find('h1').should('contain', 'Example Text')

    cy.get('button:nth-child(1)').click()

    cy.get('.tiptap h1').should('not.exist')
  })

  it('should make the paragraph a h1 keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, altKey: true, key: '1' })
      .find('h1')
      .should('contain', 'Example Text')
  })

  it('should make the paragraph a h2 keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, altKey: true, key: '2' })
      .find('h2')
      .should('contain', 'Example Text')
  })

  it('should make the paragraph a h3 keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, altKey: true, key: '3' })
      .find('h3')
      .should('contain', 'Example Text')
  })

  it('should make a h1 from the default markdown shortcut', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap').type('# Headline').find('h1').should('contain', 'Headline')
  })

  it('should make a h2 from the default markdown shortcut', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap').type('## Headline').find('h2').should('contain', 'Headline')
  })

  it('should make a h3 from the default markdown shortcut', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap').type('### Headline').find('h3').should('contain', 'Headline')
  })
})
