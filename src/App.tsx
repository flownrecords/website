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
    Questions,
    ManageQuestions,
    ViewQuestion,
    Planner,
    Navdata,
    Stats,
} from "./pages";

// Components
import Navbar from "./components/general/Navbar";
import Downloads from "./pages/general/Downloads";
import Guides from "./pages/general/Guides";
import Organizations from "./pages/organizations/Organizations";

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* GENERAL ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/download/:fileId" element={<Downloads />} />

                {/* AUTH ROUTES */}
                <Route path="/login" element={<Login />} />
                <Route path="/getstarted" element={<Register />} />

                {/* QUESTION ROUTES */}
                <Route path="/questions" element={<Questions />} />
                <Route path="/q/manage" element={<ManageQuestions />} />
                <Route path="/q/:questionId" element={<ViewQuestion />} />

                <Route path="/planner" element={<Planner />} />

                {/* USER ROUTES */}
                <Route path="/me" element={<Me />} />
                <Route path="/me/edit" element={<MeEdit />} />
                <Route path="/me/stats" element={<Stats />} />
                <Route path="/me/logbook" element={<Logbook />} />
                <Route path="/me/logbook/:entryId" element={<LogbookEntry />} />
                <Route path="/me/logbook/manual" element={<LogbookManualInput />} />
                {/* <Route path="/u/:userId" element={<Logbook/>} /> */}

                {/* DATA ROUTES */}
                <Route path="/navdata" element={<Navdata />} />

                {/* ORGANIZATION ROUTES */}
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/org/:orgId" element={<Organizations />} />

                {/* Catch-all route for 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;
