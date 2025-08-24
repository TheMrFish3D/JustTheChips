import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

import './App.css'
import About from './pages/About'
import Calculator from './pages/Calculator'
import Libraries from './pages/Libraries'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <header style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Calculator</Link>
        <Link to="/libraries">Libraries</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/about">About</Link>
      </header>
      <main style={{ padding: 12 }}>
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/libraries" element={<Libraries />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
