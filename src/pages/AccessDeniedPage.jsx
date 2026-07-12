import { Link, useLocation } from "react-router-dom";

const COPY = {
  auth: {
    title: "Изисква се вход",
    message:
      "Трябва да влезете в системата, за да достъпите арбитражните данни и другите защитени страници.",
    primary: { to: "/login", label: "Вход" },
    secondary: { to: "/register", label: "Регистрация" },
  },
  subscription: {
    title: "Нямате активен абонамент",
    message:
      "Акаунтът ви е регистриран, но няма активен период на достъп. Свържете се с нас, за да активирате абонамент.",
    primary: { to: "/contact", label: "Контакти" },
  },
  forbidden: {
    title: "Нямате достъп",
    message: "Тази страница е достъпна само за администратори.",
    primary: { to: "/", label: "Към началото" },
    secondary: { to: "/contact", label: "Контакти" },
  },
};

function resolveReason(location) {
  const fromState = location.state?.reason;
  if (fromState && COPY[fromState]) return fromState;

  const fromQuery = new URLSearchParams(location.search).get("reason");
  if (fromQuery && COPY[fromQuery]) return fromQuery;

  return "auth";
}

export default function AccessDeniedPage() {
  const location = useLocation();
  const reason = resolveReason(location);
  const content = COPY[reason];

  return (
    <div className="page">
      <div className="access-card">
        <div className="access-icon" aria-hidden="true">
          {reason === "subscription" ? "⏳" : "🔒"}
        </div>
        <h2 className="access-title">{content.title}</h2>
        <p className="access-message">{content.message}</p>
        {location.state?.detail ? (
          <p className="access-detail">{location.state.detail}</p>
        ) : null}
        <div className="access-actions">
          <Link to={content.primary.to} className="access-btn access-btn-primary">
            {content.primary.label}
          </Link>
          {content.secondary ? (
            <Link to={content.secondary.to} className="access-btn access-btn-secondary">
              {content.secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
