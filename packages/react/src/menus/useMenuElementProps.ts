import type { CSSProperties, HTMLAttributes } from 'react'
import { useLayoutEffect, useRef } from 'react'

type MenuElementProps = HTMLAttributes<HTMLDivElement>
type MenuEventListener = (event: Event) => void
type MenuEventListenerOptions = {
  capture?: boolean
}

type EventListenerEntry = {
  eventName: string
  listener: MenuEventListener
  options?: MenuEventListenerOptions
}

const PLUGIN_MANAGED_STYLE_PROPERTIES = new Set(['left', 'opacity', 'position', 'top', 'visibility', 'width'])
const UNITLESS_STYLE_PROPERTIES = new Set([
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'columnCount',
  'columns',
  'fillOpacity',
  'flex',
  'flexGrow',
  'flexShrink',
  'fontWeight',
  'gridArea',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowStart',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
])
const ATTRIBUTE_EXCLUSIONS = new Set(['children', 'className', 'style'])
const DIRECT_PROPERTY_KEYS = new Set(['tabIndex'])

function isEventProp(key: string, value: unknown): value is MenuEventListener {
  return /^on[A-Z]/.test(key) && typeof value === 'function'
}

function toAttributeName(key: string) {
  if (key.startsWith('aria-') || key.startsWith('data-')) {
    return key
  }

  return key
}

function toStylePropertyName(key: string) {
  if (key.startsWith('--')) {
    return key
  }

  return key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

function toEventConfig(key: string) {
  const useCapture = key.endsWith('Capture')
  const baseKey = useCapture ? key.slice(0, -7) : key
  const reactEventName = baseKey.slice(2)
  const eventName = reactEventName === 'DoubleClick' ? 'dblclick' : reactEventName.toLowerCase()

  return {
    eventName,
    options: useCapture ? { capture: true } : undefined,
  }
}

function isDirectPropertyKey(key: string) {
  return DIRECT_PROPERTY_KEYS.has(key)
}

function setDirectProperty(element: HTMLDivElement, key: string, value: unknown) {
  if (key === 'tabIndex') {
    element.tabIndex = Number(value)
    return
  }

  ;(element as unknown as Record<string, unknown>)[key] = value
}

function clearDirectProperty(element: HTMLDivElement, key: string) {
  if (key === 'tabIndex') {
    element.removeAttribute('tabindex')
    return
  }

  const propertyValue = (element as unknown as Record<string, unknown>)[key]

  if (typeof propertyValue === 'boolean') {
    ;(element as unknown as Record<string, unknown>)[key] = false
    return
  }

  if (typeof propertyValue === 'number') {
    ;(element as unknown as Record<string, unknown>)[key] = 0
    return
  }

  ;(element as unknown as Record<string, unknown>)[key] = ''
}

function toStyleValue(styleName: string, value: string | number) {
  if (
    typeof value !== 'number' ||
    value === 0 ||
    styleName.startsWith('--') ||
    UNITLESS_STYLE_PROPERTIES.has(styleName)
  ) {
    return String(value)
  }

  return `${value}px`
}

function removeStyleProperty(element: HTMLDivElement, styleName: string) {
  if (PLUGIN_MANAGED_STYLE_PROPERTIES.has(styleName)) {
    return
  }

  element.style.removeProperty(toStylePropertyName(styleName))
}

function applyStyleProperty(element: HTMLDivElement, styleName: string, value: string | number) {
  if (PLUGIN_MANAGED_STYLE_PROPERTIES.has(styleName)) {
    return
  }

  element.style.setProperty(toStylePropertyName(styleName), toStyleValue(styleName, value))
}

function syncAttributes(element: HTMLDivElement, prevProps: MenuElementProps, nextProps: MenuElementProps) {
  const allKeys = new Set([...Object.keys(prevProps), ...Object.keys(nextProps)])

  allKeys.forEach(key => {
    if (
      ATTRIBUTE_EXCLUSIONS.has(key) ||
      isEventProp(key, prevProps[key as keyof MenuElementProps]) ||
      isEventProp(key, nextProps[key as keyof MenuElementProps])
    ) {
      return
    }

    const prevValue = prevProps[key as keyof MenuElementProps]
    const nextValue = nextProps[key as keyof MenuElementProps]

    if (prevValue === nextValue) {
      return
    }

    const attributeName = toAttributeName(key)

    if (nextValue == null || nextValue === false) {
      if (isDirectPropertyKey(key)) {
        clearDirectProperty(element, key)
      }

      element.removeAttribute(attributeName)
      return
    }

    if (nextValue === true) {
      if (isDirectPropertyKey(key)) {
        setDirectProperty(element, key, true)
      }

      element.setAttribute(attributeName, '')
      return
    }

    if (isDirectPropertyKey(key)) {
      setDirectProperty(element, key, nextValue)
      return
    }

    element.setAttribute(attributeName, String(nextValue))
  })
}

function syncClassName(element: HTMLDivElement, prevClassName?: string, nextClassName?: string) {
  if (prevClassName === nextClassName) {
    return
  }

  if (nextClassName) {
    element.className = nextClassName
    return
  }

  element.removeAttribute('class')
}

function syncStyles(
  element: HTMLDivElement,
  prevStyle: CSSProperties | undefined,
  nextStyle: CSSProperties | undefined,
) {
  const previousStyle = prevStyle ?? {}
  const currentStyle = nextStyle ?? {}
  const allStyleNames = new Set([...Object.keys(previousStyle), ...Object.keys(currentStyle)])

  allStyleNames.forEach(styleName => {
    const prevValue = previousStyle[styleName as keyof CSSProperties]
    const nextValue = currentStyle[styleName as keyof CSSProperties]

    if (prevValue === nextValue) {
      return
    }

    if (nextValue == null) {
      removeStyleProperty(element, styleName)
      return
    }

    applyStyleProperty(element, styleName, nextValue as string | number)
  })
}

function syncEventListeners(element: HTMLDivElement, prevListeners: EventListenerEntry[], nextProps: MenuElementProps) {
  prevListeners.forEach(({ eventName, listener, options }) => {
    element.removeEventListener(eventName, listener, options)
  })

  const nextListeners: EventListenerEntry[] = []

  Object.entries(nextProps).forEach(([key, value]) => {
    if (!isEventProp(key, value)) {
      return
    }

    const { eventName, options } = toEventConfig(key)

    element.addEventListener(eventName, value, options)
    nextListeners.push({ eventName, listener: value, options })
  })

  return nextListeners
}

export function useMenuElementProps(element: HTMLDivElement, props: MenuElementProps) {
  const previousPropsRef = useRef<MenuElementProps>({})
  const listenersRef = useRef<EventListenerEntry[]>([])

  useLayoutEffect(() => {
    const previousProps = previousPropsRef.current

    syncClassName(element, previousProps.className, props.className)
    syncStyles(element, previousProps.style, props.style)
    syncAttributes(element, previousProps, props)
    listenersRef.current = syncEventListeners(element, listenersRef.current, props)
    previousPropsRef.current = props

    return () => {
      listenersRef.current.forEach(({ eventName, listener, options }) => {
        element.removeEventListener(eventName, listener, options)
      })
      listenersRef.current = []
    }
  }, [element, props])
}
