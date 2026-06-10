import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AdminPage } from "./pages/AdminPage";
import { RsvpModalProvider } from "./components/RsvpModal";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RsvpPage } from "./pages/RsvpPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RsvpModalProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rsvp" element={<RsvpPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RsvpModalProvider>
    </BrowserRouter>
  </StrictMode>
);
