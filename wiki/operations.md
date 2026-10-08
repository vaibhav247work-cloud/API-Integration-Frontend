# Frontend configuration and deployment

## Runtime environment

The frontend Docker entrypoint generates `public/env.js` from environment variables. Configure the API base URL and request timeout there rather than hard-coding a backend URL into the compiled bundle.

See `example.env` for supported variables. Build validation:

```bash
npm install
npm run build
```

## Safe configuration practice

- Do not put client passwords, access tokens, tenant database content, or private keys into the frontend environment. Browser-delivered values are visible to users.
- Store client API credentials and upload tokens on the backend or in its secret/tenant configuration.
- The UI sends integration configuration to the backend; production authorization for who can edit or run integrations should be provided by the deployment’s access-control layer.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Browser requests fail with CORS error | Add the frontend origin to backend `APP_CORS_ALLOWED_ORIGINS`. |
| Requests target the wrong backend | Inspect generated `env.js` and the API base URL. |
| Save returns configuration error | Inspect the JSON preview, enum values, required storage fields, and backend run/error diagnostics. |
| Upload or run fails after saving | Open Runs History; its backend diagnostics identify the failed step, URL, status, and error category. |
