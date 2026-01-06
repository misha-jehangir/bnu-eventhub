import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import EventRsvpsPage from "./pages/EventRsvpsPage";
import NotificationsPage from "./pages/NotificationsPage";
import OrganizerProfilePage from "./pages/OrganizerProfilePage";
import OrganizerDetailPage from "./pages/OrganizerDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/event/:eventId" element={<EventDetailPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/edit-event/:eventId" element={<EditEventPage />} />
            <Route path="/event/:eventId/rsvps" element={<EventRsvpsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/organizer-profile" element={<OrganizerProfilePage />} />
            <Route path="/organizer/:organizerId" element={<OrganizerDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
