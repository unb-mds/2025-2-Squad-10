
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from './pages/HomePage'
import MapaPege from "./pages/MapaPage"
import Layout from "./components/Geral/layout_sidebar"
import TestePage from "./pages/Teste"

function App() {
  return (
      <Router>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route element={<Layout />}>
          <Route path="/mapa" element={<MapaPege/>}/>
          <Route path="/teste" element={<TestePage/>}/>
          /* adicionar outras rotas quando as paginas estiverem prontas */
        </Route>
      </Routes>
    </Router>
  )
}

export default App
