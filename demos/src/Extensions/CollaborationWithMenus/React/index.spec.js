context('/src/Extensions/CollaborationWithMenus/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/CollaborationWithMenus/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should have menu plugins initiated', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      const bubbleMenuPlugin = editor.view.state.plugins.find(plugin => plugin.spec.key?.key === 'bubbleMenu$')
      const floatingMenuPlugin = editor.view.state.plugins.find(plugin => plugin.spec.key?.key === 'floatingMenu$')
      const hasBothMenuPluginsLoaded = !!bubbleMenuPlugin && !!floatingMenuPlugin

      expect(hasBothMenuPluginsLoaded).to.equal(true)
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
