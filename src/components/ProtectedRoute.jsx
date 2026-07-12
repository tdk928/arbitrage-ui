import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function LoadingScreen() {
  return (
    <div className="page">
      <div className="message empty">Зареждане…</div>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSubscription = false,
}) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (session.role === "anonymous") {
    return <Navigate to="/access-denied" replace state={{ reason: "auth" }} />;
  }

  if (requireAdmin && session.role !== "admin") {
    return <Navigate to="/access-denied" replace state={{ reason: "forbidden" }} />;
  }

  if (
    requireSubscription &&
    session.role === "client" &&
    !session.hasActiveSubscription
  ) {
    return (
      <Navigate to="/access-denied" replace state={{ reason: "subscription" }} />
    );
  }

  return children;
}
