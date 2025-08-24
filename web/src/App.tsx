import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Calculator from './pages/Calculator'
import Libraries from './pages/Libraries'

export default function App() {
  return (
    <BrowserRouter>
      <header style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Calculator</Link>
        <Link to="/libraries">Libraries</Link>
      </header>
      <main style={{ padding: 12 }}>
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/libraries" element={<Libraries />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
