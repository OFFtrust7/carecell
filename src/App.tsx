import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeVariantProvider } from "@/hooks/useThemeVariant";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
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
import AIChatPage from "./pages/AIChat";
import PatientsPage from "./pages/Patients";
import DonorDetailsPage from "./pages/DonorDetails";
import TreatmentTimelinePage from "./pages/TreatmentTimeline";
import MedicalDocumentsPage from "./pages/MedicalDocuments";
import EmergencyPage from "./pages/Emergency";
import CaregiversPage from "./pages/Caregivers";
import DonorMatchingPage from "./pages/DonorMatching";
import NotificationsPage from "./pages/Notifications";
import AcceptInvitePage from "./pages/AcceptInvite";
import CaregiverDashboardPage from "./pages/CaregiverDashboard";
import CaregiverPatientViewPage from "./pages/CaregiverPatientView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeVariantProvider>
        <TooltipProvider>
          <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Shared routes — both roles */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AppLayout><AppointmentsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/hospital-finder" element={<ProtectedRoute><AppLayout><HospitalFinderPage /></AppLayout></ProtectedRoute>} />
            <Route path="/ai-chat" element={<ProtectedRoute><AppLayout><AIChatPage /></AppLayout></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><AppLayout><PatientsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/emergency" element={<ProtectedRoute><AppLayout><EmergencyPage /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/accept-invite" element={<ProtectedRoute><AppLayout><AcceptInvitePage /></AppLayout></ProtectedRoute>} />
            <Route path="/caregiver" element={<ProtectedRoute><AppLayout><CaregiverDashboardPage /></AppLayout></ProtectedRoute>} />
            <Route path="/caregiver/patient/:patientId" element={<ProtectedRoute><AppLayout><CaregiverPatientViewPage /></AppLayout></ProtectedRoute>} />

            {/* Patient-only routes */}
            <Route path="/create-request" element={<ProtectedRoute><RoleProtectedRoute allowedRole="patient"><AppLayout><CreateRequestPage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><RoleProtectedRoute allowedRole="patient"><AppLayout><MyRequestsPage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/patient-card" element={<ProtectedRoute><RoleProtectedRoute allowedRole="patient"><AppLayout><PatientCardPage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/treatment-timeline" element={<ProtectedRoute><RoleProtectedRoute allowedRole="patient"><AppLayout><TreatmentTimelinePage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/medical-documents" element={<ProtectedRoute><RoleProtectedRoute allowedRole="patient"><AppLayout><MedicalDocumentsPage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/caregivers" element={<ProtectedRoute><RoleProtectedRoute allowedRole="patient"><AppLayout><CaregiversPage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/donor-matching" element={<ProtectedRoute><RoleProtectedRoute allowedRole="patient"><AppLayout><DonorMatchingPage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />

            {/* Donor-only routes */}
            <Route path="/donor-feed" element={<ProtectedRoute><RoleProtectedRoute allowedRole="donor"><AppLayout><DonorFeedPage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/donor-details" element={<ProtectedRoute><RoleProtectedRoute allowedRole="donor"><AppLayout><DonorDetailsPage /></AppLayout></RoleProtectedRoute></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
