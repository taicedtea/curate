import { DiscoveryFeed } from '../components/discovery/DiscoveryFeed.jsx'

export function DiscoverPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 px-4 py-3 backdrop-blur">
        <h1 className="font-serif text-xl font-semibold tracking-tight text-zinc-900">Curate</h1>
      </header>
      <DiscoveryFeed />
    </div>
  )
}
