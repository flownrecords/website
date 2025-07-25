import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { AlertProvider } from "./components/alert/AlertContext.tsx";
import { AuthProvider } from "./components/auth/AuthContext.tsx";

import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { BrowserRouter } from "react-router-dom";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AlertProvider>
                    <App />
                </AlertProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
