import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useArbitrageNav } from "../context/ArbitrageNavContext.jsx";

function NavGroup({ children }) {
  if (!children) return null;
  return (
    <div className="nav-group">
      <div className="nav-group-buttons">{children}</div>
    </div>
  );
}

function NavButton({ children, onClick, disabled, active }) {
  return (
    <button
      type="button"
      className={`nav-btn${active ? " nav-btn-active" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default function Navbar() {
  const { session, logout } = useAuth();
  const { nav } = useArbitrageNav();
  const navigate = useNavigate();
  const location = useLocation();

  const { role } = session;
  const isAnonymous = role === "anonymous";
  const isClient = role === "client";
  const isAdmin = role === "admin";
  const canSeeArbitrage = isClient || isAdmin;

  const loading = nav.loading;
  const view = nav.view;
  const arbSource = nav.arbSource;

  function triggerArbitrage(action) {
    navigate("/", {
      state: { arbitrageAction: action, actionId: Date.now() },
    });
  }

  function goToUsers() {
    navigate("/users", { state: { refreshAt: Date.now() } });
  }

  function goHome() {
    navigate("/", { replace: true, state: { resetHome: true } });
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button
          type="button"
          className="navbar-brand"
          onClick={goHome}
        >
          <span className="navbar-logo">A</span>
          <span className="navbar-title">Arbitrage</span>
        </button>

        <nav className="navbar-nav">
          {canSeeArbitrage && (
            <>
              <NavGroup>
                {isAdmin && (
                  <NavButton
                    onClick={() => triggerArbitrage("run")}
                    disabled={loading !== null}
                    active={location.pathname === "/" && view === "arbs" && arbSource === "run"}
                  >
                    {loading === "run" ? "Скрапване…" : "Get data"}
                  </NavButton>
                )}
                <NavButton
                  onClick={() => triggerArbitrage("top10")}
                  disabled={loading !== null}
                  active={location.pathname === "/" && view === "arbs" && arbSource === "top10"}
                >
                  {loading === "top10" ? "Зареждане…" : "Get current arbitrages"}
                </NavButton>
                <NavButton
                  onClick={() => triggerArbitrage("audit")}
                  disabled={loading !== null}
                  active={location.pathname === "/" && view === "audit"}
                >
                  {loading === "audit" ? "Зареждане…" : "Audit"}
                </NavButton>
              </NavGroup>
              <div className="nav-divider" aria-hidden="true" />
            </>
          )}

          <div className="nav-divider" aria-hidden="true" />

          <NavGroup>
            <NavButton
              onClick={() => navigate("/contact")}
              active={location.pathname === "/contact"}
            >
              Contact
            </NavButton>
          </NavGroup>

          <div className="nav-divider" aria-hidden="true" />

          <NavGroup>
            {isAnonymous && (
              <>
                <NavButton
                  onClick={() => navigate("/login")}
                  active={location.pathname === "/login"}
                >
                  Login
                </NavButton>
                <NavButton
                  onClick={() => navigate("/register")}
                  active={location.pathname === "/register"}
                >
                  Register
                </NavButton>
              </>
            )}

            {isAdmin && (
              <NavButton
                onClick={goToUsers}
                active={location.pathname === "/users"}
              >
                All users
              </NavButton>
            )}

            {!isAnonymous && (
              <NavButton onClick={handleLogout}>Logout</NavButton>
            )}
          </NavGroup>
        </nav>
      </div>
    </header>
  );
}
