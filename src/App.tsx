import "./App.css";
import "keen-slider/keen-slider.min.css";
import "leaflet/dist/leaflet.css";

// Routing
import { Routes, Route } from "react-router-dom";

// Pages
import {
    Home,
    AboutUs,
    NotFound,
    Login,
    Register,
    Me,
    Logbook,
    MeEdit,
    LogbookEntry,
    LogbookManualInput,
    Tools,
    Guides,
    Downloads,
    Navdata,
    Stats,
    Organizations,
    Plan,
    CrewLogbook,
    CrewEntry,
    Reports,
    Terms,
    Privacy,
} from "./pages";

// Components
import Navbar from "./components/general/Navbar";

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* GENERAL ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/download/:fileId" element={<Downloads />} />
                <Route path="/navdata" element={<Navdata />} />

                {/* AUTH ROUTES */}
                <Route path="/login" element={<Login />} />
                <Route path="/getstarted" element={<Register />} />

                {/* USER ROUTES */}
                <Route path="/me" element={<Me />} />
                <Route path="/me/edit" element={<MeEdit />} />
                <Route path="/me/stats" element={<Stats />} />
                <Route path="/me/plan" element={<Plan />} />
                <Route path="/me/crew" element={<CrewLogbook />} />
                <Route path="/me/crew/:entryId" element={<CrewEntry />} />
                <Route path="/me/reports" element={<Reports />} />

                <Route path="/me/logbook" element={<Logbook />} />
                <Route path="/me/logbook/:entryId" element={<LogbookEntry />} />
                <Route path="/me/logbook/manual" element={<LogbookManualInput />} />
                {/* <Route path="/u/:userId" element={<Logbook/>} /> */}

                {/* ORGANIZATION ROUTES */}
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/org/:orgId" element={<Organizations />} />

                {/* TOOLS ROUTES */}
                <Route path="/tools" element={<Tools />} />

                {/* LEGAL ROUTES */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Catch-all route for 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;
