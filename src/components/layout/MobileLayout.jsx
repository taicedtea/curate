import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav.jsx'

/** Shell used by every route. Mobile gets a fixed bottom nav; the same nav
 * grows into a persistent left rail at the >1024px desktop breakpoint
 * (Tailwind's `lg:`) instead of a separate desktop layout tree. */
export function MobileLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900 lg:flex-row">
      <BottomNav orientation="side" />
      <div className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </div>
      <BottomNav orientation="bottom" />
    </div>
  )
}
