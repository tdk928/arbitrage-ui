# Arbitrage UI — Changelog

Документ за всички промени в frontend репото. Полезен при нов Cursor чат за синхронизация с backend.

**Repo:** `arbitrage-ui`  
**Backend base URL (local):** `http://localhost:8000`  
**Frontend dev:** `http://localhost:5173`

**Backend API reference (source of truth):**  
`/Users/teodorkalev/Desktop/arbitrage/docs/API_CHANGELOG.md`

> **Поддръжка:** Обновявай този файл преди всеки merge в `development`. Сверявай с backend `API_CHANGELOG.md`.

---

## Текущо състояние (`development`)

### Backend статус (merge-нато в `arbitrage` `development`)

| Feature | Статус |
|---------|--------|
| Auth register/login | ✅ Live |
| `GET /auth/users` | ✅ Live |
| `PATCH /auth/users/{email}` | ✅ Live |
| `POST /auth/users/{email}/activate` | ✅ Live — **UI pending** |
| CORS за `localhost:5173` | ✅ |
| v3 top10 / audit / run | ✅ Live |

### UI pending (следваща работа)

1. ~~**`src/auth/api.js`** — wire `updateUser` към `PATCH /auth/users/{email}`~~ ✅
2. ~~**`src/auth/api.js`** — добави `activateUser(email)` → `POST /auth/users/{email}/activate`~~ ✅
3. ~~**`UsersPage`** — бутон „Activate 24h“ per row + confirm modal~~ ✅
4. JWT `has_active_subscription` — client features да го ползват след activate (re-login или refresh token flow)

---

## Admin: управление на потребители

### Inline edit (ръчни дати / телефон)

```
PATCH /auth/users/{email}
Authorization: Bearer <admin_token>
Content-Type: application/json

Body (partial — само променените полета):
{
  "phone": "+359888123456",
  "valid_from": "2026-07-08T10:00:00.000Z",
  "valid_to": "2026-07-10T18:00:00.000Z"
}

Response (200): UserListItem
```

- `valid_from` / `valid_to` ↔ DB `active_from` / `active_to`
- Email в URL трябва да е encoded (`user%40example.com`)

### Бърз 24ч абонамент (Activate бутон)

```
POST /auth/users/{email}/activate
Authorization: Bearer <admin_token>

(без request body)

Response (200): UserListItem
```

**Логика (backend):**
- `valid_from` = сега (UTC)
- `valid_to` = сега + 24 часа (UTC)
- За admin UI — бързо плащане/активиране; за дълги периоди ползвай PATCH с ръчни дати

**UI пример (fetch):**
```javascript
export async function activateUser(email, token) {
  const encoded = encodeURIComponent(email);
  const res = await fetch(`/auth/users/${encoded}/activate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

---

## PR: `feature/auth-navbar` (merged в UI `development`)

### Navbar & routing
- Sticky navbar с единен стил за всички бутони (`.nav-btn`)
- React Router: `/`, `/login`, `/register`, `/users`, `/contact`
- Brand бутон **Arbitrage** винаги връща към `/` и нулира home състоянието
- Vite proxy за `/auth` и `/arbitrage` → `localhost:8000`

### Role-based достъп
| Роля | Видими бутони |
|------|---------------|
| `anonymous` (default) | Login, Register, Contact |
| `client` | Get current arbitrages, Audit, Contact, Logout |
| `admin` | Get data, Get current arbitrages, Audit, All users, Contact, Logout |

### Auth модул (`src/auth/`)
- `api.js` — `register`, `login`, `fetchUsers`, `updateUser` (PATCH — wire to backend)
- `token.js` — JWT parse, localStorage (`arbitrage_access_token`), expiry
- `AuthContext.jsx` — session state, auto-logout при изтичане на токен
- `types.js` — TypeScript-style JSDoc типове

### Страници
- **Login** (`/login`) — форма, при успех redirect към `/`
- **Register** (`/register`) — форма, при успех auto-login + redirect към `/`
- **Users** (`/users`, admin) — таблица с потребители от `GET /auth/users`
- **Contact** (`/contact`) — placeholder lorem ipsum (видим за всички)
- **Home** (`/`) — hero изображение, arbitrage карти и audit view

### Admin Users таблица (UI компоненти готови)
- **Телефон** — text input (`EditableUserField`)
- **Valid from / Valid to** — inline календар + ръчен час (`InlineDateTimePicker`)
- **Activate 24h** — **не е имплементиран** (виж pending по-горе)

---

## PR: `feature/audit-view` (merged)

- Бутон **Audit** в actions bar
- `GET /arbitrage/v3/audit` — top 20 audit записи
- `AuditCard` компонент

---

## PR: `feature/arbitrage-dashboard` (merged)

- Vite + React scaffold, dark theme
- `POST /arbitrage/v3/run`, `GET /arbitrage/v3/top10`
- `ArbCard` + stake calculator + total return amount

---

## API endpoints използвани от UI

| Method | Path | Роля | UI статус |
|--------|------|------|-----------|
| `POST` | `/arbitrage/v3/run` | admin | ✅ |
| `GET` | `/arbitrage/v3/top10` | client, admin | ✅ |
| `GET` | `/arbitrage/v3/audit` | client, admin | ✅ |
| `DELETE` | `/arbitrage/v3/audit` | admin | ✅ |
| `DELETE` | `/arbitrage/v3/top10/{rank}` | admin | ✅ |
| `POST` | `/auth/register` | anonymous | ✅ |
| `POST` | `/auth/login` | anonymous | ✅ |
| `GET` | `/auth/users` | admin | ✅ |
| `PATCH` | `/auth/users/{email}` | admin | ✅ |
| `POST` | `/auth/users/{email}/activate` | admin | ✅ Activate 24h + confirm modal |

---

## Smoke test

```bash
# Frontend
npm run dev   # http://localhost:5173

# Backend
cd ../arbitrage && source .venv/bin/activate
uvicorn api.main:app --reload --port 8000

# Health
curl http://localhost:8000/health

# Top 10
curl http://localhost:8000/arbitrage/v3/top10

# Activate 24h (admin)
curl -X POST "http://localhost:8000/auth/users/user%40example.com/activate" \
  -H "Authorization: Bearer <admin_token>"
```
