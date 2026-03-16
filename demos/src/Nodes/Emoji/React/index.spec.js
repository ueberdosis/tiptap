context('/src/Nodes/Emoji/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Nodes/Emoji/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p></p>')
    })
    cy.get('.tiptap').click()
  })

  it('insert :smile: via typing', () => {
    cy.get('.tiptap').type(':smile:')
    // after typing the shortcode the emoji should be rendered as a node
    cy.get('.tiptap').find('[data-type="emoji"][data-name="smile"]').should('exist')
  })

  it('insert button inserts an emoji node', () => {
    cy.get('button').contains('Insert ⚡').click()
    cy.get('.tiptap').find('[data-type="emoji"][data-name="zap"]').should('exist')
  })

  it('pasting a URL containing :x: does not convert the shortcode', () => {
    const url = 'https://example-url.com/:x:/sub'
    cy.get('.tiptap').paste({ paste: url })

    cy.get('.tiptap').contains(url)
    cy.get('.tiptap').find('[data-type="emoji"]').should('not.exist')
  })

  it('pasting a standalone shortcode converts to an emoji node', () => {
    cy.get('.tiptap').paste({ paste: ':smile:' })
    cy.get('.tiptap').find('[data-type="emoji"]').should('exist')
  })
})
