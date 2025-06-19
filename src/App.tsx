import './App.css'
import 'keen-slider/keen-slider.min.css';
import 'leaflet/dist/leaflet.css';

// Routing
import { Routes, Route } from 'react-router-dom';

// Pages
import { Home, AboutUs, NotFound, Login, Register, Me, Logbook, MeEdit, LogbookEntry, Tools } from './pages';

// Components
import Navbar from './components/general/Navbar';

function App() {
  return (
    <>
      <Navbar/>  
        <Routes>          
          {/* GENERAL ROUTES */}          
          <Route path="/" element={<Home/>} />
          <Route path="/tools" element={<Tools/>} />
          <Route path="/about" element={<AboutUs/>} />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login/>} />
          <Route path="/getstarted" element={<Register/>} />

          {/* USER ROUTES */}
          <Route path="/me" element={<Me/>} />
          <Route path="/me/edit" element={<MeEdit/>} />
          <Route path="/me/logbook" element={<Logbook/>} />
          <Route path="/me/logbook/:entryId" element={<LogbookEntry/>} />

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound/>} />
        </Routes>
    </>
  )
}

export default App
