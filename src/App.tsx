import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Landing from "./pages/Landing";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import CreateRequestPage from "./pages/CreateRequest";
import DonorFeedPage from "./pages/DonorFeed";
import MyRequestsPage from "./pages/MyRequests";
import PatientCardPage from "./pages/PatientCard";
import ProfilePage from "./pages/Profile";
import AppointmentsPage from "./pages/Appointments";
import HospitalFinderPage from "./pages/HospitalFinder";
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
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
            <Route path="/create-request" element={<ProtectedRoute><AppLayout><CreateRequestPage /></AppLayout></ProtectedRoute>} />
            <Route path="/donor-feed" element={<ProtectedRoute><AppLayout><DonorFeedPage /></AppLayout></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><AppLayout><MyRequestsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/patient-card" element={<ProtectedRoute><AppLayout><PatientCardPage /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
