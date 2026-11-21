import { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function Modal({ isOpen, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const dialogNode = dialogRef.current

    if (!dialogNode) return

    const dialog: HTMLDivElement = dialogNode

    const getFocusableElements = (): HTMLElement[] =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS),
      ).filter(
        (element) =>
          element.getAttribute('aria-hidden') !== 'true' &&
          !element.hasAttribute('disabled') &&
          element.getClientRects().length > 0,
      )

    // Move keyboard focus into the dialog when it opens.
    const focusableElements = getFocusableElements()
    ;(focusableElements[0] ?? dialog).focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const elements = getFocusableElements()

      if (elements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const firstElement = elements[0]
      const lastElement = elements[elements.length - 1]
      const currentIndex = elements.findIndex(
        (element) => element === document.activeElement,
      )

      // Focus may have been moved outside the dialog programmatically.
      if (currentIndex === -1) {
        event.preventDefault()
        ;(event.shiftKey ? lastElement : firstElement).focus()
        return
      }

      if (event.shiftKey && currentIndex === 0) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && currentIndex === elements.length - 1) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    function handleFocusIn(event: FocusEvent) {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        const elements = getFocusableElements()
        ;(elements[0] ?? dialog).focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)

      // Return focus to the element that opened the dialog.
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <h2 id="modal-title">Accessible Modal Dialog</h2>

        <p>
          This dialog supports keyboard focus management, focus trapping,
          Escape to close, and focus restoration.
        </p>

        <button type="button" onClick={onClose}>
          Close dialog
        </button>
      </div>
    </div>
  )
}

export default Modal
