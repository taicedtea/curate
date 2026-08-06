import { Routes, Route } from 'react-router-dom'
import { MobileLayout } from './components/layout/MobileLayout.jsx'
import { DiscoverPage } from './pages/DiscoverPage.jsx'
import { CreateWallPage } from './pages/CreateWallPage.jsx'
import { WallViewPage } from './pages/WallViewPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/create" element={<CreateWallPage />} />
        <Route path="/wall/:wallId/edit" element={<CreateWallPage />} />
        <Route path="/wall/:wallId" element={<WallViewPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:photographerId" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
