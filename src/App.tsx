import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Tracks } from './pages/Tracks'
import { Sharks } from './pages/Sharks'
import { Ideas } from './pages/Ideas'
import { Faq } from './pages/Faq'
import { Register } from './pages/Register'
import { Admin } from './pages/Admin'
import { Jury } from './pages/Jury'
import { Team } from './pages/Team'

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/jury" element={<Jury />} />
      <Route path="/team" element={<Team />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tracks" element={<Tracks />} />
        <Route path="/sharks" element={<Sharks />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
