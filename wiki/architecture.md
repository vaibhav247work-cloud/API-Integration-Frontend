# Frontend architecture

## Pages

```mermaid
flowchart LR
  APP[App.jsx / React Router] --> DASH[Dashboard]
  APP --> LIST[Integrations]
  APP --> BUILD[Integration Builder]
  APP --> JOBS[Execution Jobs]
  APP --> RUNS[Runs History]
  APP --> FAIL[Retry Queue]
  BUILD --> API[Axios API client]
  LIST --> API
  JOBS --> API
  RUNS --> API
  FAIL --> API
  API --> BACKEND[Integration Engine /api]
```

`Layout` provides the shared navigation. The pages are routed beneath `/`; new and edit builder routes are `/integrations/new` and `/integrations/:id/edit`.

## API connection

The Axios client reads `appRuntimeConfig.apiBaseUrl` and `appRuntimeConfig.apiTimeoutMs`. Runtime configuration is loaded from `public/env.js`, which allows the same compiled frontend image to point to different backend environments at deployment time.

```mermaid
sequenceDiagram
  participant Browser
  participant Env as /env.js
  participant React as React application
  participant API as Backend API
  Browser->>Env: Load runtime variables
  Browser->>React: Load bundled application
  React->>API: Axios request using configured base URL
  API-->>React: JSON response or error
  React-->>Browser: Page data / toast feedback
```

The backend must permit the UI origin through `APP_CORS_ALLOWED_ORIGINS`.
