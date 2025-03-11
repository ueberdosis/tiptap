import { type Component, type JSX } from 'solid-js'

// types to have better intellisense with components using `as`:

export type DomElement = (keyof JSX.IntrinsicElements) | Component<any>
export type DomElementProps<T extends DomElement> = T extends Component<infer P> ? P : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] : never
export type DomElementAsProps<T extends DomElement, Props = object> = Omit<DomElementProps<T>, 'as' | keyof Props> & { as?: T; } & Props
export type DomElementRef<T extends DomElement> = T extends Component ? T : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] extends JSX.DOMAttributes<infer E> ? E : never : never;
