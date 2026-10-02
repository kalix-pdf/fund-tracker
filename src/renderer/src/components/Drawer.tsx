import { useEffect, useId, useState, type ReactNode } from 'react'

interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  meta?: ReactNode
  children: ReactNode
}

export function Drawer({ open, title, onClose, meta, children }: DrawerProps): React.JSX.Element | null {
  const titleId = useId()
  // Stays true while the exit animation plays, after `open` has gone false.
  const [mounted, setMounted] = useState(open)

  // Derived-state update during render: mount immediately when opening.
  if (open && !mounted) setMounted(true)

  const closing = mounted && !open

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div
      className={closing ? 'drawer-backdrop is-closing' : 'drawer-backdrop'}
      onClick={onClose}
    >
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={(e) => {
          // Ignore bubbled animationend events from children.
          if (closing && e.target === e.currentTarget) setMounted(false)
        }}
      >
        <header className="drawer__header">
          <div>
            <h2 id={titleId} className="drawer__title">{title}</h2>
            {meta}
          </div>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="drawer__body">{children}</div>
      </aside>
    </div>
  )
}