interface AppHeaderProps {
  appName: string
  section: string
  userName: string
  userRole: string
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function WalletIcon(): React.JSX.Element {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" />
      <path d="M16 13.5h.01" />
    </svg>
  )
}

export function AppHeader({
  appName,
  section,
  userName,
  userRole
}: AppHeaderProps): React.JSX.Element {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo">
          <WalletIcon />
        </div>
        <div className="app-header__titles">
          <span className="app-header__name">{appName}</span>
          <span className="app-header__section">{section}</span>
        </div>
      </div>

      <div className="app-header__user">
        <div className="app-header__user-info">
          <span className="app-header__user-name">{userName}</span>
          <span className="app-header__user-role">{userRole}</span>
        </div>
        <div className="app-header__avatar" aria-hidden="true">
          {getInitials(userName)}
        </div>
      </div>
    </header>
  )
}