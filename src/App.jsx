import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { ArbitrageNavProvider } from "./context/ArbitrageNavContext.jsx";
import { UsersRefreshProvider } from "./context/UsersRefreshContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AccessDeniedPage from "./pages/AccessDeniedPage.jsx";

function GuestOnlyRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session.role !== "anonymous") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute requireSubscription>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <RegisterPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requireAdmin>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ArbitrageNavProvider>
          <UsersRefreshProvider>
            <AppRoutes />
          </UsersRefreshProvider>
        </ArbitrageNavProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
