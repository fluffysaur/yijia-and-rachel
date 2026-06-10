import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AdminPage } from "./pages/AdminPage";
import { AuthProvider } from "./components/auth/AuthContext";
import { EntryGate } from "./components/auth/EntryGate";
import { RsvpModalProvider } from "./components/RsvpModal";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RsvpPage } from "./pages/RsvpPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RsvpModalProvider>
          <Routes>
            <Route path="/" element={<EntryGate><HomePage /></EntryGate>} />
            <Route path="/rsvp" element={<EntryGate><RsvpPage /></EntryGate>} />
            <Route path="/admin" element={<EntryGate requireAdmin><AdminPage /></EntryGate>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RsvpModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
