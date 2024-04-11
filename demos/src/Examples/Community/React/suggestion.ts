import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList'

interface SuggestionProps {
  query: string;
  editor: any;
  clientRect?: (() => DOMRect | null) | null | undefined;
}


interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const suggestions = {
  items: ({ query }: { query: string }) => {
    return [
      'Lea Thompson',
      'Cyndi Lauper',
      'Tom Cruise',
      'Madonna',
      'Jerry Hall',
      'Joan Collins',
      'Winona Ryder',
      'Christina Applegate',
      'Alyssa Milano',
      'Molly Ringwald',
      'Ally Sheedy',
      'Debbie Harry',
      'Olivia Newton-John',
      'Elton John',
      'Michael J. Fox',
      'Axl Rose',
      'Emilio Estevez',
      'Ralph Macchio',
      'Rob Lowe',
      'Jennifer Grey',
      'Mickey Rourke',
      'John Cusack',
      'Matthew Broderick',
      'Justine Bateman',
      'Lisa Bonet',
    ]
      .filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5);
  },

  render: () => {
    let component: ReactRenderer | null = null;
    let popup: any; // no types in docs

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

   popup = tippy(document.body, {
  getReferenceClientRect: () => {
    // Check if props.clientRect is a function and call it, using the result if it's not null
    const rect = props.clientRect ? props.clientRect() : null;
    // If the rect is null (either because props.clientRect was not a function or it returned null),
    // fallback to the document.body's rect
    return rect || document.body.getBoundingClientRect();
  },
  appendTo: () => document.body,
  content: component.element,
  showOnCreate: true,
  interactive: true,
  trigger: 'manual',
  placement: 'bottom-start',
});
      },

      onUpdate: (props: SuggestionProps) => {
        if (component) {
          component.updateProps(props);
        }

        if (popup && props.clientRect) {
          popup[0].setProps({
            getReferenceClientRect: () => props.clientRect,
          });
        }
      },

      onKeyDown: (props: { event: KeyboardEvent }) => {
        if (props.event.key === 'Escape') {
          if (popup) {
            popup[0].hide();
          }
          return true;
        }


  // Adjusted to type assert `component.ref` as `MentionListRef`
        return component?.ref ? (component.ref as MentionListRef).onKeyDown(props) : false;    },

     onExit: () => {
  // Directly call destroy on popup if it exists, without treating it as an array
  if (popup) {
    popup.destroy();
  }
  if (component) {
    component.destroy();
  }
},
    };
  },
};

export default suggestions;
