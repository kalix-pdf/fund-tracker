import { useRef, type CSSProperties, type KeyboardEvent } from 'react'

interface TabItem<T extends string> {
  id: T
  label: string
}

interface TabsProps<T extends string> {
  tabs: readonly TabItem<T>[]
  active: T
  onChange: (id: T) => void
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: TabsProps<T>): React.JSX.Element {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === active))

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const last = tabs.length - 1
    let next: number
    switch (e.key) {
      case 'ArrowRight':
        next = activeIndex === last ? 0 : activeIndex + 1
        break
      case 'ArrowLeft':
        next = activeIndex === 0 ? last : activeIndex - 1
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = last
        break
      default:
        return
    }
    e.preventDefault()
    onChange(tabs[next].id)
    refs.current[next]?.focus()
  }

  const style = {
    '--tabs-count': tabs.length,
    '--tabs-index': activeIndex,
  } as CSSProperties

  return (
    <div className="tabs" role="tablist" style={style} onKeyDown={handleKeyDown}>
      <span className="tabs__thumb" aria-hidden="true" />
      {tabs.map((tab, i) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={`tabs__btn${selected ? ' tabs__btn--active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}