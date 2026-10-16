/*
  Usage (from server/ folder):
    node scripts/admin-tabs-test.js

  This script:
   - logs in as seeded admin (admin/admin123)
   - calls the 3 admin endpoints used by the frontend tabs
   - prints status codes + small payload previews
*/

const http = require('http');

const BASE_HOST = process.env.HOST || 'localhost';
const BASE_PORT = Number(process.env.PORT || 1227);

const loginPath = '/api/auth/login';

const get = (path, token) => {
  return new Promise((resolve, reject) => {
    const req = http.get(
      {
        hostname: BASE_HOST,
        port: BASE_PORT,
        path,
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', reject);
  });
};

const post = (path, data) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: BASE_HOST,
        port: BASE_PORT,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

const previewJson = (text) => {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return trimmed.slice(0, 300);
  try {
    const parsed = JSON.parse(trimmed);
    const out = Array.isArray(parsed) ? parsed.slice(0, 2) : parsed;
    return JSON.stringify(out, null, 2).slice(0, 600);
  } catch {
    return trimmed.slice(0, 300);
  }
};

(async () => {
  try {
    console.log(`Logging in to http://${BASE_HOST}:${BASE_PORT}${loginPath} ...`);

    const loginRes = await post(loginPath, {
      username: 'admin',
      password: 'admin123',
    });

    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes.status, loginRes.body);
      process.exit(1);
    }

    const token = JSON.parse(loginRes.body).token;
    console.log('Login OK. Token acquired.');

    const performancePath = '/api/performance-reviews';
    const attritionPath = '/api/attrition?latest=true';

    // The seed inserts employees with employeeId 4,5,6 (see seed.js). Default to 4.
    const employeeId = process.env.EMPLOYEE_ID ? Number(process.env.EMPLOYEE_ID) : 4;
    const skillsPath = `/api/employee-skills/gap-analysis/${employeeId}`;

    console.log(`\nCalling Performance Reviews: ${performancePath}`);
    const perf = await get(performancePath, token);
    console.log('Status:', perf.status);
    console.log('Preview:', previewJson(perf.body));

    console.log(`\nCalling Skills Gap Analysis: ${skillsPath}`);
    const gap = await get(skillsPath, token);
    console.log('Status:', gap.status);
    console.log('Preview:', previewJson(gap.body));

    console.log(`\nCalling Attrition (latest=true): ${attritionPath}`);
    const attr = await get(attritionPath, token);
    console.log('Status:', attr.status);
    console.log('Preview:', previewJson(attr.body));
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
