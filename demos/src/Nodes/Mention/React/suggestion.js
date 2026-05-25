import { ReactRenderer } from '@tiptap/react'

import { updatePosition } from '../../../utils/updatePosition.js'
import MentionList from './MentionList.jsx'

const allItems = [
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
  'Patrick Swayze',
  'Demi Moore',
  'Bruce Willis',
  'Arnold Schwarzenegger',
  'Sylvester Stallone',
  'Harrison Ford',
  'Meryl Streep',
  'Julia Roberts',
  'Tom Hanks',
  'Meg Ryan',
  'Kevin Costner',
  'Sean Penn',
  'Michelle Pfeiffer',
  'Jodie Foster',
  'Sigourney Weaver',
  'Glenn Close',
  'Diane Keaton',
  'Cher',
  'Whoopi Goldberg',
  'Bette Midler',
  'Steve Martin',
  'Eddie Murphy',
  'Bill Murray',
  'Dan Aykroyd',
  'Chevy Chase',
  'Richard Pryor',
  'Gene Wilder',
  'Mel Gibson',
  'Danny DeVito',
  'Jack Nicholson',
  'Al Pacino',
  'Robert De Niro',
  'Dustin Hoffman',
  'Robin Williams',
  'Goldie Hawn',
  'Sally Field',
  'Jessica Lange',
  'Kathleen Turner',
  'Milla Jovovich',
  'Heather Locklear',
  'Heather Graham',
  'Pamela Anderson',
  'Sharon Stone',
  'Kim Basinger',
  'Melanie Griffith',
  'Geena Davis',
  'Susan Sarandon',
  'Drew Barrymore',
  'Cameron Diaz',
  'Nicole Kidman',
  'Sandra Bullock',
  'Halle Berry',
  'Angelina Jolie',
  'Jennifer Lopez',
  'Jennifer Aniston',
  'Courteney Cox',
  'Lisa Kudrow',
  'Sarah Jessica Parker',
  'Kim Cattrall',
  'Kristin Davis',
  'Cynthia Nixon',
  'Uma Thurman',
  'Gwyneth Paltrow',
  'Cate Blanchett',
  'Kate Winslet',
  'Emma Thompson',
  'Helena Bonham Carter',
  'Megan Fox',
  'Keanu Reeves',
  'Ewan McGregor',
  'Patrick Stewart',
  'Ian McKellen',
]

export default {
  items: async ({ query, signal }) => {
    // Simulate an async API call
    await new Promise(resolve => {
      setTimeout(resolve, 300)
    })

    // Bail out if the request was aborted (e.g. user kept typing or closed the popup)
    if (signal.aborted) {
      return []
    }

    // find items that include this character query
    return allItems.filter(item => item.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
  },

  minQueryLength: 2,

  debounce: 300,

  initialItems: ['Lea Thompson', 'Cyndi Lauper', 'Tom Cruise'],

  render: () => {
    let component

    return {
      onStart: props => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        component.element.style.position = 'absolute'

        document.body.appendChild(component.element)

        updatePosition({ editor: props.editor, element: component.element })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        updatePosition({ editor: props.editor, element: component.element })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          component.destroy()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        component.element.remove()
        component.destroy()
      },
    }
  },
}
