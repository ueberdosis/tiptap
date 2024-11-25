import './styles.scss'

import Image from '@tiptap/extension-image'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback, useState } from 'react'

const mapNodePosToString = nodePos => `[${nodePos.node.type.name} ${nodePos.range.from}-${nodePos.range.to}] ${nodePos.textContent} | ${JSON.stringify(nodePos.node.attrs)}`

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],
    content: `
      <h1>This is an example document to play around with the NodePos implementation of Tiptap.</h1>
      <p>
        This is a <strong>simple</strong> paragraph.
      </p>
      <img src="https://placehold.co/200x200" alt="A 200x200 square thumbnail from placehold.co." />
      <p>
        Here is another paragraph inside this document.
      </p>
      <blockquote>
        <p>Here we have a paragraph inside a blockquote.</p>
      </blockquote>
      <ul>
        <li>
          <p>Unsorted 1</p>
        </li>
        <li>
          <p>Unsorted 2</p>
          <ul>
            <li>
              <p>Unsorted 2.1</p>
            </li>
            <li>
              <p>Unsorted 2.2</p>
            </li>
            <li>
              <p>Unsorted 2.3</p>
            </li>
          </ul>
        </li>
        <li>
          <p>Unsorted 3</p>
        </li>
      </ul>
      <ol>
        <li>
          <p>Sorted 1</p>
        </li>
        <li>
          <p>Sorted 2</p>
          <ul>
            <li>
              <p>Sorted 2.1</p>
            </li>
            <li>
              <p>Sorted 2.2</p>
            </li>
            <li>
              <p>Sorted 2.3</p>
            </li>
          </ul>
        </li>
        <li>
          <p>Sorted 3</p>
        </li>
      </ol>
      <blockquote>
        <p>Here we have another paragraph inside a blockquote.</p>
        <blockquote>
          <img src="https://placehold.co/260x200" alt="A 260x200 landscape thumbnail from placehold.co." />
          <img src="https://placehold.co/100x200" alt="A 100x200 portrait thumbnail from placehold.co." />
        </blockquote>
      </blockquote>
      <img src="https://placehold.co/260x200" alt="A 260x200 landscape thumbnail from placehold.co." />
    `,
  })

  const [foundNodes, setFoundNodes] = useState(null)

  const findParagraphs = useCallback(() => {
    const nodePositions = editor.$doc.querySelectorAll('paragraph')

    if (!nodePositions) {
      setFoundNodes(null)
      return
    }

    setFoundNodes(nodePositions)
  }, [editor])

  const findListItems = useCallback(() => {
    const nodePositions = editor.$doc.querySelectorAll('listItem')

    if (!nodePositions) {
      setFoundNodes(null)
      return
    }

    setFoundNodes(nodePositions)
  }, [editor])

  const findBulletList = useCallback(() => {
    const nodePositions = editor.$doc.querySelectorAll('bulletList')

    if (!nodePositions) {
      setFoundNodes(null)
      return
    }

    setFoundNodes(nodePositions)
  }, [editor])

  const findOrderedList = useCallback(() => {
    const nodePositions = editor.$doc.querySelectorAll('orderedList')

    if (!nodePositions) {
      setFoundNodes(null)
      return
    }

    setFoundNodes(nodePositions)
  }, [editor])

  const findBlockquote = useCallback(() => {
    const nodePositions = editor.$doc.querySelectorAll('blockquote')

    if (!nodePositions) {
      setFoundNodes(null)
      return
    }

    setFoundNodes(nodePositions)
  }, [editor])

  const findImages = useCallback(() => {
    const nodePositions = editor.$doc.querySelectorAll('image')

    if (!nodePositions) {
      setFoundNodes(null)
      return
    }

    setFoundNodes(nodePositions)
  }, [editor])

  const findFirstBlockquote = useCallback(() => {
    const nodePosition = editor.$doc.querySelector('blockquote')

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes([nodePosition])
  }, [editor])

  const findSquaredImage = useCallback(() => {
    const nodePosition = editor.$doc.querySelector('image', { src: 'https://placehold.co/200x200' })

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes([nodePosition])
  }, [editor])

  const findLandscapeImage = useCallback(() => {
    const nodePosition = editor.$doc.querySelector('image', { src: 'https://placehold.co/260x200' })

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes([nodePosition])
  }, [editor])

  const findAllLandscapeImages = useCallback(() => {
    const nodePosition = editor.$doc.querySelectorAll('image', { src: 'https://placehold.co/260x200' })

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes(nodePosition)
  }, [editor])

  const findFirstLandscapeImageWithAllQuery = useCallback(() => {
    const nodePosition = editor.$doc.querySelectorAll('image', { src: 'https://placehold.co/260x200' }, true)

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes(nodePosition)
  }, [editor])

  const findPortraitImageInBlockquote = useCallback(() => {
    const nodePosition = editor.$doc.querySelector('image', { src: 'https://placehold.co/100x200' })

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes([nodePosition])
  }, [editor])

  const findFirstNode = useCallback(() => {
    const nodePosition = editor.$doc.firstChild

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes([nodePosition])
  }, [editor])

  const findLastNode = useCallback(() => {
    const nodePosition = editor.$doc.lastChild

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes([nodePosition])
  }, [editor])

  const findLastNodeOfFirstBulletList = useCallback(() => {
    const nodePosition = editor.$doc.querySelector('bulletList').lastChild

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes([nodePosition])
  }, [editor])

  const findNonexistentNode = useCallback(() => {
    const nodePosition = editor.$doc.querySelector('nonexistent')

    if (!nodePosition) {
      setFoundNodes(null)
      return
    }

    setFoundNodes([nodePosition])
  }, [editor])

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button data-testid="find-paragraphs" onClick={findParagraphs}>Find paragraphs</button>
          <button data-testid="find-listitems" onClick={findListItems}>Find list items</button>
          <button data-testid="find-bulletlists" onClick={findBulletList}>Find bullet lists</button>
          <button data-testid="find-orderedlists" onClick={findOrderedList}>Find ordered lists</button>
          <button data-testid="find-blockquotes" onClick={findBlockquote}>Find blockquotes</button>
          <button data-testid="find-images" onClick={findImages}>Find images</button>
        </div>
        <div className="button-group">
          <button data-testid="find-first-blockquote" onClick={findFirstBlockquote}>Find first blockquote</button>
          <button data-testid="find-squared-image" onClick={findSquaredImage}>Find squared image</button>
          <button data-testid="find-landscape-image" onClick={findLandscapeImage}>Find landscape image</button>
          <button data-testid="find-all-landscape-images" onClick={findAllLandscapeImages}>Find all landscape images</button>
          <button data-testid="find-first-landscape-image-with-all-query" onClick={findFirstLandscapeImageWithAllQuery}>Find first landscape image with all query</button>
          <button data-testid="find-portrait-image-inside-blockquote" onClick={findPortraitImageInBlockquote}>Find portrait image in blockquote</button>
        </div>
        <div className="button-group">
          <button data-testid="find-first-node" onClick={findFirstNode}>Find first node</button>
          <button data-testid="find-last-node" onClick={findLastNode}>Find last node</button>
          <button data-testid="find-last-node-of-first-bullet-list" onClick={findLastNodeOfFirstBulletList}>Find last node of first bullet list</button>
          <button data-testid="find-nonexistent-node" onClick={findNonexistentNode}>Find nonexistent node</button>
        </div>
      </div>
      <EditorContent editor={editor} />
      {foundNodes ? <div className="output-group" data-testid="found-nodes">{foundNodes.map(n => (
        <div data-testid="found-node" key={n.pos}>{mapNodePosToString(n)}</div>
      ))}</div> : ''}
    </>
  )
}
