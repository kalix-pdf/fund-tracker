interface Tab<T extends string> { id: T; label: string }

export function Tabs<T extends string>({
  tabs, active, onChange,
}: { tabs: Tab<T>[]; active: T; onChange: (id: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === active}
          className={`tabs__tab${t.id === active ? ' tabs__tab--active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}