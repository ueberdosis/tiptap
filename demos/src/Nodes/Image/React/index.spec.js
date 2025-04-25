context('/src/Nodes/Image/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Nodes/Image/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should add an img tag with the correct URL', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('foobar.png')

      cy.get('button:first').click()

      cy.window().its('prompt').should('be.called')

      cy.get('.tiptap').find('img').should('have.attr', 'src', 'foobar.png')
    })
  })

  it('should have the resize handles on the image', () => {
    const editor = cy.get('.tiptap')

    // we are going to look for the first image container
    const firstImg = editor.find('[data-node="image"]').first()

    const handles = {
      left: firstImg.find('.resize-handle-left'),
      right: firstImg.find('.resize-handle-right'),
      top: firstImg.find('.resize-handle-top'),
      bottom: firstImg.find('.resize-handle-bottom'),
      topLeft: firstImg.find('.resize-handle-top-left'),
      topRight: firstImg.find('.resize-handle-top-right'),
      bottomLeft: firstImg.find('.resize-handle-bottom-left'),
      bottomRight: firstImg.find('.resize-handle-bottom-right'),
    }

    Object.values(handles).forEach(handle => {
      handle.should('exist')
    })
  })
})
