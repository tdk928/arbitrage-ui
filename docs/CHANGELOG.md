# Arbitrage UI — Changelog

Документ за всички промени в frontend репото. Полезен при нов Cursor чат за синхронизация с backend.

**Repo:** `arbitrage-ui`  
**Backend base URL (local):** `http://localhost:8000`  
**Frontend dev:** `http://localhost:5173`

---

## PR: `feature/auth-navbar` (текущ)

### Navbar & routing
- Sticky navbar с единен стил за всички бутони (`.nav-btn`)
- React Router: `/`, `/login`, `/register`, `/users`, `/contact`
- Brand бутон **Arbitrage** винаги връща към `/` и нулира home състоянието
- Vite proxy за `/auth` → `localhost:8000`

### Role-based достъп
| Роля | Видими бутони |
|------|---------------|
| `anonymous` (default) | Login, Register, Contact |
| `client` | Get current arbitrages, Audit, Contact, Logout |
| `admin` | Get data, Get current arbitrages, Audit, All users, Contact, Logout |

### Auth модул (`src/auth/`)
- `api.js` — `register`, `login`, `fetchUsers`, `updateUser` (PATCH stub)
- `token.js` — JWT parse, localStorage (`arbitrage_access_token`), expiry
- `AuthContext.jsx` — session state, auto-logout при изтичане на токен
- `types.js` — TypeScript-style JSDoc типове

### Страници
- **Login** (`/login`) — форма, при успех redirect към `/`
- **Register** (`/register`) — форма, при успех auto-login + redirect към `/`
- **Users** (`/users`, admin) — таблица с потребители от `GET /auth/users`
- **Contact** (`/contact`) — placeholder lorem ipsum (видим за всички)
- **Home** (`/`) — hero изображение, arbitrage карти и audit view

### Admin: редактиране на потребители (UI готов, backend pending)
Inline редакция в таблицата:
- **Телефон** — text input
- **Valid from / Valid to** — inline календар + ръчен час (ЧЧ:ММ)

**Pending endpoint:**
```
PATCH /auth/users/{email}
Authorization: Bearer <admin_token>

Body (partial — само променените полета):
{
  "phone": "+359888123456",
  "valid_from": "2026-07-08T10:00:00.000Z",
  "valid_to": "2026-07-10T18:00:00.000Z"
}

Response: UserListItem (email, phone, valid_from, valid_to)
```

### Нови файлове
```
public/home-hero.png
src/auth/
src/components/Navbar.jsx
src/components/EditableUserField.jsx
src/components/InlineDateTimePicker.jsx
src/context/ArbitrageNavContext.jsx
src/pages/HomePage.jsx
src/pages/LoginPage.jsx
src/pages/RegisterPage.jsx
src/pages/UsersPage.jsx
src/pages/ContactPage.jsx
docs/CHANGELOG.md
```

### Зависимости
- `react-router-dom` ^7.x

### Backend изискване
Auth endpoints са на branch `feature/auth-login-register` (не е merge-нат в `development` към момента на този UI PR).

---

## PR: `feature/audit-view` (merged в `development`)

### Промени
- Бутон **Audit** в actions bar
- `GET /arbitrage/v3/audit` — top 20 audit записи
- Двуколонен layout без grid gaps (`splitIntoColumns`)
- `AuditCard` компонент: rank, margin, match, market, legs, scrape date
- Лилав accent стил за audit картите

**Commit:** `6fa229c` — Add audit view with balanced two-column layout.

---

## PR: `feature/arbitrage-dashboard` (merged в `development`)

### Промени (натрупани commits)

#### 1. Initial dashboard (`39dfafe`)
- Vite + React 18 scaffold
- `POST /arbitrage/v3/run` — scrape trigger
- `GET /arbitrage/v3/top10` — top 10 arbitrage snapshot
- `ArbCard` — match, market, kickoff, margin %, legs table
- Vite proxy `/arbitrage` → backend
- Dark theme UI

#### 2. Stake calculator (`efb18f9`)
- Input „Обща сума" на всяка карта
- Автоматично изчисление на stake per leg (arbitrage split)
- Read-only stake полета в legs table

#### 3. Total return amount (`1e73c24`)
- Показване на обща върната сума (budget + profit) до margin %

#### 4. Audit view (`6fa229c`) — виж по-горе

---

## API endpoints използвани от UI

| Method | Path | Роля | Описание |
|--------|------|------|----------|
| `POST` | `/arbitrage/v3/run` | admin | Scrape + arbitrage |
| `GET` | `/arbitrage/v3/top10` | client, admin | Top 10 snapshot |
| `GET` | `/arbitrage/v3/audit` | client, admin | Audit top 20 |
| `POST` | `/auth/register` | anonymous | Регистрация |
| `POST` | `/auth/login` | anonymous | Login |
| `GET` | `/auth/users` | admin | Списък потребители |
| `PATCH` | `/auth/users/{email}` | admin | **Pending** — partial user update |

---

## Smoke test

```bash
# Frontend
npm run dev   # http://localhost:5173

# Backend (auth branch)
uvicorn api.main:app --reload --port 8000

# Health
curl http://localhost:8000/health

# Top 10
curl http://localhost:8000/arbitrage/v3/top10
```
