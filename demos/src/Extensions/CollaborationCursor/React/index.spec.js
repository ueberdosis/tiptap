context('/src/Extensions/CollaborationCursor/React', () => {
  before(() => {
    cy.visit('/src/Extensions/CollaborationCursor/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should have a ydoc', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      /**
       * @type {import('yjs').Doc}
       */
      const yDoc = editor.extensionManager.extensions.find(a => a.name === 'collaboration').options.document

      // eslint-disable-next-line
      expect(yDoc).to.not.be.null
    })
  })
})
