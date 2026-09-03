import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'

import { undeclaredWidgetProps } from '../src/utils/undeclaredWidgetProps.js'

const render = () => h('span')

describe('undeclaredWidgetProps', () => {
  it('declares the context props a component does not declare', () => {
    const component = defineComponent({ props: { label: String }, render })

    expect(undeclaredWidgetProps(component, { label: 'a' })).toEqual({
      editor: null,
      getPos: null,
    })
  })

  it('skips props the component already declares', () => {
    const component = defineComponent({
      props: { editor: Object, getPos: Function, label: String },
      render,
    })

    expect(undeclaredWidgetProps(component, { label: 'a' })).toEqual({})
  })

  it('declares passed props the component is missing', () => {
    const component = defineComponent({ props: { label: String }, render })

    expect(undeclaredWidgetProps(component, { label: 'a', count: 1 })).toEqual({
      editor: null,
      getPos: null,
      count: null,
    })
  })

  it('reads array prop declarations', () => {
    const component = defineComponent({ props: ['label', 'get-pos'], render })

    expect(undeclaredWidgetProps(component, { label: 'a' })).toEqual({ editor: null })
  })

  it('reads props from extends and mixins', () => {
    const component = defineComponent({
      extends: defineComponent({ props: { editor: Object }, render }),
      mixins: [defineComponent({ props: { label: String }, render })],
      render,
    })

    expect(undeclaredWidgetProps(component, { label: 'a' })).toEqual({ getPos: null })
  })

  it('handles a component without props', () => {
    expect(undeclaredWidgetProps(defineComponent({ render }), {})).toEqual({
      editor: null,
      getPos: null,
    })
  })
})
