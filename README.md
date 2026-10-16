# HRMS Project
Testing VS Code Git integration.

## Admin tab seeded API verification (quick)
If you’re working on the admin tabs (Performance Reviews, Employee Skills/Gap Analysis, Attrition), you can verify the backend returns seeded MongoDB-backed sample data via an authenticated call.

### 1) Start backend
From `server/`:
```powershell
npm run dev
```

### 2) Verify endpoints with JWT + seeded data
From `server/`:
```powershell
node scripts/admin-tabs-test.js
```

Optional:
- Choose which seeded employee to use for the skills gap endpoint:
```powershell
$env:EMPLOYEE_ID = 4; node scripts/admin-tabs-test.js
```

This script logs in as the seeded admin user (`admin` / `admin123`), calls:
- `GET /api/performance-reviews`
- `GET /api/employee-skills/gap-analysis/:employeeId`
- `GET /api/attrition?latest=true`

…and prints status codes + payload previews.

> Note: For deterministic local testing, `server/src/seed.js` hard-resets the collections required by these admin tabs.
