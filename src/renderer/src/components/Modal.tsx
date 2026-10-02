import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  /** When false, Escape and backdrop clicks are ignored (e.g. while saving). */
  dismissible?: boolean
  children: ReactNode
}

export function Modal({ title, onClose, dismissible = true, children }: ModalProps): React.JSX.Element {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const el = ref.current
    if (el && !el.open) el.showModal()
  }, [])

  function handleCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
    // Fired on Escape. Block it while the modal shouldn't be dismissed.
    if (!dismissible) e.preventDefault()
  }

  function handleBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    // The dialog has no padding, so a click whose target is the dialog itself is a backdrop click.
    if (dismissible && e.target === e.currentTarget) ref.current?.close()
  }

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className="modal__body">
        <h3 className="modal__title" id={titleId}>
          {title}
        </h3>
        {children}
      </div>
    </dialog>
  )
}