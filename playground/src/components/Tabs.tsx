import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

interface TabItem {
  id: string
  label: string
  panelId: string
  content: string
}

const TABS: readonly TabItem[] = [
  {
    id: 'overview-tab',
    label: 'Overview',
    panelId: 'overview-panel',
    content:
      'A short introduction to this component and how it behaves.',
  },
  {
    id: 'features-tab',
    label: 'Features',
    panelId: 'features-panel',
    content:
      'Keyboard navigation, roving focus, and automatic activation.',
  },
  {
    id: 'settings-tab',
    label: 'Settings',
    panelId: 'settings-panel',
    content: 'Options for configuring this example.',
  },
]

function Tabs() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const activateTab = (index: number) => {
    setSelectedIndex(index)
    tabRefs.current[index]?.focus()
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const lastIndex = TABS.length - 1
    let nextIndex: number

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = index === lastIndex ? 0 : index + 1
        break
      case 'ArrowLeft':
        nextIndex = index === 0 ? lastIndex : index - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = lastIndex
        break
      default:
        return
    }

    event.preventDefault()
    activateTab(nextIndex)
  }

  return (
    <div className="tabs">
      <div
        role="tablist"
        aria-label="Example tabs"
        aria-orientation="horizontal"
        className="tab-list"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            type="button"
            role="tab"
            id={tab.id}
            aria-selected={selectedIndex === index}
            aria-controls={tab.panelId}
            tabIndex={selectedIndex === index ? 0 : -1}
            className="tab"
            onClick={() => activateTab(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS.map((tab, index) => (
        <div
          key={tab.panelId}
          role="tabpanel"
          id={tab.panelId}
          aria-labelledby={tab.id}
          tabIndex={0}
          hidden={selectedIndex !== index}
          className="tab-panel"
        >
          <p>{tab.content}</p>
        </div>
      ))}
    </div>
  )
}

export default Tabs
