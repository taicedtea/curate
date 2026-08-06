import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Discover', icon: DiscoverIcon, end: true },
  { to: '/create', label: 'Create', icon: CreateIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
]

function DiscoverIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function CreateIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function ProfileIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 4.2-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
    </svg>
  )
}

export function BottomNav({ orientation = 'bottom' }) {
  const isSide = orientation === 'side'

  return (
    <nav
      className={
        isSide
          ? 'hidden lg:flex lg:flex-col lg:items-center lg:gap-1 lg:w-20 lg:shrink-0 lg:border-r lg:border-zinc-800 lg:bg-zinc-950 lg:py-6'
          : 'fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-zinc-800 bg-zinc-950/95 pb-safe pt-1 backdrop-blur lg:hidden'
      }
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              'flex flex-col items-center justify-center gap-1 text-[11px] tracking-wide transition-colors',
              isSide ? 'w-14 py-3 rounded-lg' : 'min-w-[64px] flex-1 py-2',
              isActive ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-200',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <Icon active={isActive} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
