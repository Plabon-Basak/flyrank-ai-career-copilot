import { useCallback, useState } from 'react'
import Disclosure from './components/Disclosure'
import Modal from './components/Modal'
import Tabs from './components/Tabs'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <main className="playground">
      <header className="playground-header">
        <h1>Accessible Components Playground</h1>
        <p>FE-05 — Frontend AI Engineering</p>
      </header>

      <div className="component-grid">
        <section className="component-card" aria-labelledby="modal-section-title">
          <h2 id="modal-section-title">1. Modal Dialog</h2>
          <p className="component-description">
            A dialog that moves focus inside while open and returns it to the
            trigger when closed.
          </p>
          <p className="keyboard-hint">
            <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> cycle focus in
            the dialog; <kbd>Esc</kbd> closes it.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => setIsModalOpen(true)}
          >
            Open modal
          </button>
          <Modal isOpen={isModalOpen} onClose={closeModal} />
        </section>

        <section className="component-card" aria-labelledby="tabs-section-title">
          <h2 id="tabs-section-title">2. Tabs</h2>
          <p className="component-description">
            A tab set with automatic activation and one panel visible at a time.
          </p>
          <p className="keyboard-hint">
            <kbd>Left arrow</kbd> and <kbd>Right arrow</kbd> move between tabs;{' '}
            <kbd>Home</kbd> and <kbd>End</kbd> jump to the first and last tab.{' '}
            <kbd>Tab</kbd> moves into the selected panel.
          </p>
          <Tabs />
        </section>

        <section
          className="component-card"
          aria-labelledby="disclosure-section-title"
        >
          <h2 id="disclosure-section-title">3. Disclosure</h2>
          <p className="component-description">
            A button that reveals and hides a named region of explanatory
            content.
          </p>
          <p className="keyboard-hint">
            Press <kbd>Enter</kbd> or <kbd>Space</kbd> on the question to expand
            or collapse the answer.
          </p>
          <Disclosure />
        </section>
      </div>
    </main>
  )
}

export default App
