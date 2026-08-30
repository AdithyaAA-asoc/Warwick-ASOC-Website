import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import JoinModal from './components/JoinModal.jsx'
import { JoinModalProvider } from './context/JoinModalContext.jsx'
import About from './pages/About.jsx'
import Execs from './pages/Execs.jsx'
import Membership from './pages/Membership.jsx'
import Gallery from './pages/Gallery.jsx'

// HashRouter is used deliberately: it lets the built site be opened
// directly from a file (dist/index.html) or hosted on any static host
// (GitHub Pages, university web space, etc.) with zero server-side
// routing configuration. Swap to BrowserRouter later if/when the site
// moves behind a server that can handle SPA rewrites.
export default function App() {
  return (
    <JoinModalProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<About />} />
            <Route path="/execs" element={<Execs />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/gallery" element={<Gallery />} />
          </Route>
        </Routes>
      </HashRouter>
      <JoinModal />
    </JoinModalProvider>
  )
}
