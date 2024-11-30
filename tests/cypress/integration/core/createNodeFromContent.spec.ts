/// <reference types="cypress" />

import { createNodeFromContent, getSchemaByResolvedExtensions } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('createNodeFromContent', () => {
  it('creates a fragment from a schema and HTML content', () => {
    const content = '<p>Example Text</p>'

    const fragment = createNodeFromContent(content, getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
    ]))

    expect(fragment.toJSON()).to.deep.eq([{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }])
  })

  it('if `errorOnInvalidContent` is true, creates a fragment from a schema and HTML content', () => {
    const content = '<p>Example Text</p>'

    const fragment = createNodeFromContent(content, getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
    ]), { errorOnInvalidContent: true })

    expect(fragment.toJSON()).to.deep.eq([{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }])
  })

  it('creates a fragment from a schema and JSON content', () => {
    const content = {
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }

    const fragment = createNodeFromContent(content, getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
    ]))

    expect(fragment.toJSON()).to.deep.eq({
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    })
  })

  it('if `errorOnInvalidContent` is true, creates a fragment from a schema and JSON content', () => {
    const content = {
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }

    const fragment = createNodeFromContent(content, getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
    ]), { errorOnInvalidContent: true })

    expect(fragment.toJSON()).to.deep.eq({
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    })
  })

  it('creates a fragment from a schema and JSON array of content', () => {
    const content = [{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }, {
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'More Text',
      }],
    }]

    const fragment = createNodeFromContent(content, getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
    ]))

    expect(fragment.toJSON()).to.deep.eq([{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }, {
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'More Text',
      }],
    }])
  })

  it('if `errorOnInvalidContent` is true, creates a fragment from a schema and JSON array of content', () => {
    const content = [{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }, {
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'More Text',
      }],
    }]

    const fragment = createNodeFromContent(content, getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
    ]), { errorOnInvalidContent: true })

    expect(fragment.toJSON()).to.deep.eq([{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }, {
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'More Text',
      }],
    }])
  })

  it('returns empty content when a schema does not have matching node types for JSON content', () => {
    const content = {
      type: 'non-existing-node-type',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }

    const fragment = createNodeFromContent(content, getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
    ]))

    expect(fragment.toJSON()).to.deep.eq(null)
  })

  it('returns empty content when a schema does not have matching node types for HTML content', () => {
    const content = '<non-existing-node-type>Example Text</non-existing-node-type>'

    const fragment = createNodeFromContent(content, getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
    ]))

    expect(fragment.toJSON()).to.deep.eq([{ type: 'text', text: 'Example Text' }])
  })

  it('if `errorOnInvalidContent` is true, will throw an error when a schema does not have matching node types for HTML content', () => {
    const content = '<non-existing-node-type>Example Text</non-existing-node-type>'

    expect(() => {
      createNodeFromContent(content, getSchemaByResolvedExtensions([
        Document,
        Paragraph,
        Text,
      ]), { errorOnInvalidContent: true })
    }).to.throw('[tiptap error]: Invalid HTML content')
  })

  it('if `errorOnInvalidContent` is true, will throw an error when a schema does not have matching node types for JSON content', () => {
    const content = {
      type: 'non-existing-node-type',
      content: [{
        type: 'text',
        text: 'Example Text',
      }],
    }

    expect(() => {
      createNodeFromContent(content, getSchemaByResolvedExtensions([
        Document,
        Paragraph,
        Text,
      ]), { errorOnInvalidContent: true })
    }).to.throw('[tiptap error]: Invalid JSON content')
  })

  it('if `errorOnInvalidContent` is true, will throw an error when a schema does not have matching mark types for JSON content', () => {
    const content = {
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Example Text',
        marks: [{
          type: 'non-existing-mark-type',
        }],
      }],
    }

    expect(() => {
      createNodeFromContent(content, getSchemaByResolvedExtensions([
        Document,
        Paragraph,
        Text,
      ]), { errorOnInvalidContent: true })
    }).to.throw('[tiptap error]: Invalid JSON content')
  })

  it('if `errorOnInvalidContent` is true, will throw an error, when the JSON content does not follow the nesting rules of the schema', () => {
    const content = {
      type: 'paragraph',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: 'Example Text',
        }],
      }],
    }

    expect(() => {
      createNodeFromContent(content, getSchemaByResolvedExtensions([
        Document,
        Paragraph,
        Text,
      ]), { errorOnInvalidContent: true })
    }).to.throw('[tiptap error]: Invalid JSON content')
  })
})
