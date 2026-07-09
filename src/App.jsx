import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { ArbitrageNavProvider } from "./context/ArbitrageNavContext.jsx";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";

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
        <Route path="/" element={<HomePage />} />
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
        <Route path="/users" element={<UsersPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
          <AppRoutes />
        </ArbitrageNavProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
