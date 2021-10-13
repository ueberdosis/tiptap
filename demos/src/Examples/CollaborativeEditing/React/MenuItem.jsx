import React from 'react'
import './MenuItem.scss'
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'

export default ({
  icon, title, action, isActive = null,
}) => (
  <button
    className={`menu-item${isActive && isActive() ? ' is-active' : ''}`}
    onClick={action}
    title={title}
  >
    <svg className="remix">
      <use xlinkHref={`${remixiconUrl}#ri-${icon}`} />
    </svg>
  </button>
)
