import { act, createElement, useLayoutEffect } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { NodeViewComponentProps } from '../components/NodeViewComponentProps.js'
import { useMergedRefs } from '../refs.js'
import { renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const paragraphs = (count: number) =>
  Array.from({ length: count }, (_, i) => `<p>paragraph ${i} with some text content</p>`).join('')

const measure = async (label: string, fn: () => Promise<void> | void): Promise<number> => {
  const start = performance.now()

  await fn()
  const ms = performance.now() - start

  console.log(`${label}: ${ms.toFixed(1)}ms`)
  return ms
}

/**
 * The runbook's Phase 15 gate. The hard regression guards are the
 * render/mount counters (typing must not be O(document)); the latency
 * budgets carry generous headroom over measured values (happy-dom,
 * 2026-07: mount 10k ≈ 0.7s, keystroke @ 10k ≈ 20ms, selection move ≈ 3ms)
 * so they catch complexity regressions, not machine noise.
 */
/** Mounts a `count`-paragraph editor and measures mount + 10 keystrokes. */
const measureAtScale = async (count: number) => {
  let harness: Awaited<ReturnType<typeof renderTiptapEditor>>
  const mountMs = await measure(`mount ${count}`, async () => {
    harness = await renderTiptapEditor(paragraphs(count))
  })
  const { editor, view } = harness!
  const midPos = editor.state.doc.resolve(editor.state.doc.content.size / 2).start()

  const typeMs = await measure(`10 keystrokes @ ${count}`, async () => {
    for (let i = 0; i < 10; i += 1) {
      await act(async () => {
        view.dispatch(view.state.tr.insertText('x', midPos + i))
      })
    }
  })

  return { editor, midPos, mountMs, typeMs }
}

describe('performance', () => {
  it('renders and types within budget at 1k paragraphs', async () => {
    const { mountMs, typeMs } = await measureAtScale(1000)

    expect(mountMs).toBeLessThan(2000)
    expect(typeMs / 10).toBeLessThan(60)
  }, 60000)

  it('renders and types within budget at 10k paragraphs', async () => {
    const { editor, midPos, mountMs, typeMs } = await measureAtScale(10000)

    const selectMs = await measure('selection move @ 10k', async () => {
      await act(async () => {
        editor.commands.setTextSelection(midPos + 40)
      })
    })

    expect(mountMs).toBeLessThan(5000)
    // Typing must stay far from the unoptimized O(document) ~300ms/keystroke
    expect(typeMs / 10).toBeLessThan(120)
    expect(selectMs).toBeLessThan(60)
  }, 120000)

  it('typing renders only the edited node, chunked and flat', async () => {
    const renderCounts = new Map<string, number>()
    let mounts = 0

    const ProbeParagraph = (props: NodeViewComponentProps) => {
      const label = props.node.textContent

      renderCounts.set(label, (renderCounts.get(label) ?? 0) + 1)
      // Count mounts through an empty-deps effect
      useLayoutEffect(() => {
        mounts += 1
      }, [])
      return createElement(
        'p',
        { ref: useMergedRefs(props.ref, props.contentDOMRef) },
        props.children,
      )
    }

    // 400 paragraphs: above the chunking threshold
    for (const count of [100, 400]) {
      renderCounts.clear()
      mounts = 0

      const { editor, view } = await renderTiptapEditor(paragraphs(count), [], {
        paragraph: ProbeParagraph,
      })

      const mountsAfterSetup = mounts
      const midPos = editor.state.doc.resolve(editor.state.doc.content.size / 2).start()

      renderCounts.clear()
      await act(async () => {
        view.dispatch(view.state.tr.insertText('x', midPos))
      })

      // No remounts, and only the edited paragraph re-rendered
      expect(mounts, `no new mounts at ${count}`).toBe(mountsAfterSetup)
      expect(renderCounts.size, `re-rendered paragraphs at ${count}`).toBeLessThanOrEqual(1)

      await unmountTrackedRoots()
    }
  }, 60000)

  it('applies remote whole-doc replaces without full remounts at scale', async () => {
    // The collab path: a wholesale setContent triggers the reactKeys rescue
    const { editor, view, dom } = await renderTiptapEditor(paragraphs(1000))
    const firstHost = dom.querySelector('p') as HTMLElement

    const replaceMs = await measure('wholesale replace @ 1k', async () => {
      await act(async () => {
        // Replace with almost-identical content (one paragraph edited), as a
        // remote y-sync transaction would
        const html = paragraphs(1000).replace('paragraph 500 ', 'paragraph 500x ')

        editor.commands.setContent(html)
      })
    })

    // Content-identity rescue kept the untouched paragraph's host element
    expect(dom.querySelector('p')).toBe(firstHost)
    expect(view.state.doc.textContent).toContain('paragraph 500x')
    expect(replaceMs).toBeLessThan(2000)
  }, 60000)
})
