import './App.css'

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, AboutUs, NotFound } from './pages';
import Navbar from './components/general/Navbar';

function App() {
  return (
    <>
      <Router>
        <Navbar/>  
        <Routes>          
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<AboutUs/>} />
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
