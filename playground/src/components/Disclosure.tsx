import { useId, useState } from 'react'

function Disclosure() {
  const [isOpen, setIsOpen] = useState(false)
  const id = useId()
  const buttonId = `${id}-button`
  const panelId = `${id}-panel`

  return (
    <div className="disclosure">
      <h3 className="disclosure-heading">
        <button
          type="button"
          id={buttonId}
          className="disclosure-button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
        >
          What is accessible component design?
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="disclosure-panel"
        hidden={!isOpen}
      >
        <p>
          Accessible component design means building interfaces that everyone
          can use, including people who navigate by keyboard or rely on assistive
          technology. It uses semantic HTML, clear labels and state information,
          visible focus indicators, and predictable keyboard behavior so controls
          work consistently across devices and browsers.
        </p>
      </div>
    </div>
  )
}

export default Disclosure
