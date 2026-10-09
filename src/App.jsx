import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import HomeRedirect from "./components/auth/HomeRedirect";
import AppLayout from "./components/layout/AppLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import TicketResolvePage from "./pages/TicketResolvePage";

import DashboardPage from "./pages/customer/DashboardPage";
import ComplaintsPage from "./pages/customer/ComplaintsPage";
import NewComplaintPage from "./pages/customer/NewComplaintPage";
import ServiceRequestsPage from "./pages/customer/ServiceRequestsPage";
import NewServiceRequestPage from "./pages/customer/NewServiceRequestPage";

import AssignedTicketsPage from "./pages/employee/AssignedTicketsPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AllTicketsPage from "./pages/admin/AllTicketsPage";
import CustomersPage from "./pages/admin/CustomersPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import ReportsPage from "./pages/admin/ReportsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/tickets/:resource/:id" element={<TicketDetailPage />} />
                <Route path="/tickets/:id" element={<TicketResolvePage />} />

                <Route element={<ProtectedRoute roles={["CUSTOMER"]} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/complaints" element={<ComplaintsPage />} />
                  <Route path="/complaints/new" element={<NewComplaintPage />} />
                  <Route path="/service-requests" element={<ServiceRequestsPage />} />
                  <Route path="/service-requests/new" element={<NewServiceRequestPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={["EMPLOYEE"]} />}>
                  <Route path="/assigned" element={<AssignedTicketsPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/tickets" element={<AllTicketsPage />} />
                  <Route path="/admin/customers" element={<CustomersPage />} />
                  <Route path="/admin/employees" element={<EmployeesPage />} />
                  <Route path="/admin/reports" element={<ReportsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
