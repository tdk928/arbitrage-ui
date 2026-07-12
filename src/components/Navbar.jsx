import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useArbitrageNav } from "../context/ArbitrageNavContext.jsx";
import { useUsersRefresh } from "../context/UsersRefreshContext.jsx";

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
  const { requestUsersRefresh } = useUsersRefresh();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { role } = session;
  const isAnonymous = role === "anonymous";
  const isClient = role === "client";
  const isAdmin = role === "admin";
  const canSeeArbitrage = isClient || isAdmin;

  const loading = nav.loading;
  const view = nav.view;
  const arbSource = nav.arbSource;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function triggerArbitrage(action) {
    closeMenu();
    navigate("/", {
      state: { arbitrageAction: action, actionId: Date.now() },
    });
  }

  function goToUsers() {
    closeMenu();
    requestUsersRefresh();
    if (location.pathname !== "/users") {
      navigate("/users");
    }
  }

  function goHome() {
    closeMenu();
    navigate("/", { replace: true, state: { resetHome: true } });
  }

  function handleLogout() {
    closeMenu();
    logout();
    navigate("/", { replace: true });
  }

  function goTo(path) {
    closeMenu();
    navigate(path);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-top-row">
          <button type="button" className="navbar-brand" onClick={goHome}>
            <span className="navbar-logo">A</span>
            <span className="navbar-title">Arbitrage</span>
          </button>

          <button
            type="button"
            className={`navbar-toggle${menuOpen ? " navbar-toggle-open" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Затвори меню" : "Отвори меню"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`navbar-nav${menuOpen ? " navbar-nav-open" : ""}`}>
          {canSeeArbitrage && (
            <>
              <NavGroup>
                {isAdmin && (
                  <NavButton
                    onClick={() => triggerArbitrage("run")}
                    disabled={loading !== null}
                    active={
                      location.pathname === "/" &&
                      view === "arbs" &&
                      arbSource === "run"
                    }
                  >
                    {loading === "run" ? "Скрапване…" : "Скрапни данни"}
                  </NavButton>
                )}
                <NavButton
                  onClick={() => triggerArbitrage("top10")}
                  disabled={loading !== null}
                  active={
                    location.pathname === "/" &&
                    view === "arbs" &&
                    arbSource === "top10"
                  }
                >
                  {loading === "top10" ? "Зареждане…" : "Текущи арбитражи"}
                </NavButton>
                <NavButton
                  onClick={() => triggerArbitrage("audit")}
                  disabled={loading !== null}
                  active={location.pathname === "/" && view === "audit"}
                >
                  {loading === "audit" ? "Зареждане…" : "История на арбитражите"}
                </NavButton>
              </NavGroup>
              <div className="nav-divider" aria-hidden="true" />
            </>
          )}

          <NavGroup>
            <NavButton
              onClick={() => goTo("/contact")}
              active={location.pathname === "/contact"}
            >
              Контакти
            </NavButton>
          </NavGroup>

          <div className="nav-divider" aria-hidden="true" />

          <NavGroup>
            {isAnonymous && (
              <>
                <NavButton
                  onClick={() => goTo("/login")}
                  active={location.pathname === "/login"}
                >
                  Вход
                </NavButton>
                <NavButton
                  onClick={() => goTo("/register")}
                  active={location.pathname === "/register"}
                >
                  Регистрация
                </NavButton>
              </>
            )}

            {isAdmin && (
              <NavButton
                onClick={goToUsers}
                active={location.pathname === "/users"}
              >
                Потребители
              </NavButton>
            )}

            {!isAnonymous && (
              <NavButton onClick={handleLogout}>Изход</NavButton>
            )}
          </NavGroup>
        </nav>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Затвори меню"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
