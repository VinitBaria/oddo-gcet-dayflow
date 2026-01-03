import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Attendance from "./pages/Attendance";
import TimeOff from "./pages/TimeOff";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute requireAdmin>
                  <AppLayout>
                    <Employees />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EmployeeProfile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EmployeeProfile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Attendance />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-off"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TimeOff />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
