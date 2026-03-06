# CoBrother Frontend — Complete Setup Guide

## What Was Built

A complete React + Vite frontend for CoBrother with:
- **OAuth Login** (Google) + Email/Password + OTP Login
- **Profile Completion Lightbox** — blocks app until user fills firstname + lastname
- **Ventures** — Create, Edit, Delete your own ventures; Apply to others via Co-Venture modal
- **Community** — View all members, fill/update your community profile
- **Auto token refresh** — Axios interceptor handles 401s silently
- **Route Guards** — `ProtectedRoute` (auth only) + `ProfileGuard` (auth + profileComplete)

---

## Project File Structure

```
cobrother-frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx                         ← All routes defined here
    ├── index.css                       ← Full design system / global styles
    ├── api/
    │   ├── axios.js                    ← Axios instance + interceptors
    │   └── services.js                 ← All API calls (auth, venture, community, domain)
    ├── context/
    │   └── AuthContext.jsx             ← Global auth state (user, login, logout)
    ├── components/
    │   ├── auth/
    │   │   └── ProtectedRoute.jsx      ← Route guards
    │   ├── layout/
    │   │   └── AppLayout.jsx           ← Top nav + page shell
    │   ├── profile/
    │   │   └── ProfileCompletionModal.jsx  ← First-login lightbox
    │   └── venture/
    │       ├── VentureForm.jsx         ← Reusable form for create/edit
    │       └── CoVentureModal.jsx      ← Apply to co-venture modal
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── OAuthCallbackPage.jsx
        ├── CompleteProfilePage.jsx     ← Wraps the modal
        ├── DashboardPage.jsx
        ├── VenturesPage.jsx
        ├── NewVenturePage.jsx
        ├── EditVenturePage.jsx
        └── CommunityPage.jsx
```

---

## Step 1 — Create the Vite Project

Open your terminal and run:

```bash
npm create vite@latest cobrother-frontend -- --template react
cd cobrother-frontend
```

This generates a fresh React + Vite scaffold.

---

## Step 2 — Install Dependencies

```bash
npm install axios react-router-dom
```

That's all you need. No heavy UI libraries required.

---

## Step 3 — Replace / Create All Files

Delete the generated boilerplate files first:

```bash
rm src/App.css src/assets/react.svg
```

Then copy each file from the provided source into your project, maintaining the exact folder structure shown above. Create folders as needed:

```bash
mkdir -p src/api src/context src/components/auth src/components/layout
mkdir -p src/components/profile src/components/venture src/pages
```

Copy all provided files into their respective paths.

---

## Step 4 — Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:8080
```

Change the URL to wherever your Spring Boot backend is running.

---

## Step 5 — Configure OAuth Callback URL in Spring Boot

The frontend's OAuth callback route is `/oauth/callback`.

In your Spring Boot security config, your OAuth2 success handler needs to redirect to:

```
http://localhost:3000/oauth/callback?accessToken=JWT&refreshToken=REFRESH&isNewUser=true/false
```

**Important:** The `OAuthCallbackPage.jsx` reads these query params. Make sure your backend `OAuth2AuthenticationSuccessHandler` redirects there with those exact param names.

Example Spring Boot handler snippet:

```java
String redirectUrl = frontendUrl + "/oauth/callback"
    + "?accessToken=" + accessToken
    + "&refreshToken=" + refreshToken
    + "&isNewUser=" + isNewUser;
response.sendRedirect(redirectUrl);
```

Also add to your CORS config:
```java
.allowedOrigins("http://localhost:3000")
```

---

## Step 6 — Run the Dev Server

```bash
npm run dev
```

App will be available at: **http://localhost:3000**

---

## Step 7 — Understand the Auth Flow

### First-Time OAuth Login
```
User clicks "Continue with Google"
  → Redirected to Spring Boot OAuth2 endpoint
  → Spring Boot authenticates → creates AppUser (profileComplete=false)
  → Redirects to /oauth/callback?accessToken=...&isNewUser=true
  → OAuthCallbackPage stores tokens → refreshUser() fetches profile
  → ProfileGuard detects profileComplete=false → redirects to /complete-profile
  → User fills firstname + lastname → PUT /api/v1/profile/complete
  → profileComplete=true saved → navigate to /dashboard
```

### Returning User
```
User logs in (any method)
  → Token stored → refreshUser() fetches profile
  → profileComplete=true → ProfileGuard allows through → /dashboard
```

### Token Refresh
```
Any API call → axios interceptor attaches Bearer token
  → If 401 response → auto-POST /api/v1/auth/refresh
  → New access token stored → original request retried
  → If refresh also fails → localStorage cleared → redirect to /login
```

---

## Step 8 — Understand Route Guards

Two guards in `src/components/auth/ProtectedRoute.jsx`:

| Guard | Checks | Redirect if failed |
|---|---|---|
| `ProtectedRoute` | Is user logged in? | `/login` |
| `ProfileGuard` | Logged in AND `profileComplete=true`? | `/complete-profile` |

In `App.jsx`:
- `/complete-profile` uses `ProtectedRoute` only (user logged in but profile incomplete)
- All app pages (`/dashboard`, `/ventures`, `/community`) use `ProfileGuard`

---

## Step 9 — Add a GET /all Endpoint for Ventures (Backend)

The `VenturesPage.jsx` is ready to display ventures but the provided backend only has `GET /api/v1/venture/{id}`. You'll need to add a list endpoint to your `VentureService` and `VentureController`:

```java
// In VentureController.java — add this:
@GetMapping("/all")
public ResponseEntity<List<Venture>> getAllVentures() {
    return ventureService.getAllVentures();
}

// In VentureController.java — add for user's own ventures:
@GetMapping("/my")
public ResponseEntity<List<Venture>> getMyVentures() {
    AppUser user = currentUserService.getCurrentUser();
    return ventureService.getVenturesByUser(user);
}
```

Then in `VenturesPage.jsx`, uncomment and use:

```javascript
// In VenturesPage.jsx useEffect:
useEffect(() => {
  setLoading(true);
  ventureAPI.getAll()  // add getAll: () => api.get('/api/v1/venture/all') to services.js
    .then(({ data }) => setVentures(Array.isArray(data) ? data : data.data || []))
    .finally(() => setLoading(false));
}, []);
```

---

## Step 10 — Community Profile Flow

The community page has two parts:

**Viewing:** `GET /api/v1/community/all` — fetches all community profiles and displays cards.

**Joining/Editing:** The user clicks "+ Join Community" → a form slides open → `PUT /api/v1/community/{id}` saves role, skills, industry, location.

**Important:** The `PUT /community/{id}` endpoint uses the **Community entity's ID**, not the AppUser's ID. The frontend finds the user's community profile by matching `profile.appUser.id === user.id` in the fetched list.

If a user hasn't joined yet (no community profile), you may need to add a `POST /api/v1/community` endpoint in Spring Boot to create a new community entry, since the current controller only has `PUT` for updates.

---

## Checklist Before Running

- [ ] Spring Boot backend running on port 8080
- [ ] `.env` file created with correct `VITE_API_URL`
- [ ] Spring Boot CORS allows `http://localhost:3000`
- [ ] OAuth2 success handler redirects to `http://localhost:3000/oauth/callback`
- [ ] Spring Boot security permits these public paths: `/api/v1/auth/**`, `/oauth2/**`, `/login/oauth2/**`

---

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy to Vercel, Netlify, or serve with Nginx.

For production, update your `.env`:
```
VITE_API_URL=https://api.yourdomain.com
```

And update your backend CORS + OAuth redirect URLs accordingly.
