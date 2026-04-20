import http from 'node:http';
import https from 'node:https';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'http://localhost:3001';
const OUT = '/home/d3shi/university/computer-science-bachelor/lab-eco/market-research/screenshots';

// Helper: HTTP request
function request(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

// Get CSRF token and login cookie
async function login(email, password) {
  // Get CSRF token
  const csrfRes = await request(`${BASE}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers['set-cookie'] || [];
  const { csrfToken } = JSON.parse(csrfRes.body);
  const cookieHeader = csrfCookies.map(c => c.split(';')[0]).join('; ');

  // Login
  const loginBody = new URLSearchParams({
    csrfToken,
    email,
    password,
    json: 'true',
  }).toString();

  const loginRes = await request(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieHeader,
    },
    body: loginBody,
  });

  const allCookies = [...csrfCookies, ...(loginRes.headers['set-cookie'] || [])];
  return allCookies.map(c => c.split(';')[0]).join('; ');
}

function screenshot(url, outputPath, cookies, width = 1280, height = 800) {
  const profileDir = mkdtempSync(join(tmpdir(), 'ff-'));

  // Write cookie file for Firefox (we'll use a simpler approach - write a page that sets cookie and redirects)
  // Actually, Firefox headless --screenshot doesn't support cookies easily.
  // Let's use a different approach: create a temporary HTML that redirects after setting cookies

  // Simplest: use curl to get the HTML and create a local file, but that won't render JS.
  // Better: use a small node script with puppeteer-core... but no Chrome.

  // Workaround: Firefox with a cookie injection page
  const cookieParts = cookies.split('; ').map(c => {
    const [name, ...rest] = c.split('=');
    return { name, value: rest.join('=') };
  });

  // Create a userjs to inject cookies
  const userJs = `
user_pref("network.cookie.cookieBehavior", 0);
`;
  writeFileSync(join(profileDir, 'user.js'), userJs);

  // Create cookies.sqlite is too complex. Use a proxy approach instead:
  // Create a local HTML file that document.cookie sets all cookies then redirects
  const setCookieScript = cookieParts.map(c =>
    `document.cookie = "${c.name}=${c.value}; path=/";`
  ).join('\n');

  const redirectPage = `<!DOCTYPE html><html><body><script>
${setCookieScript}
window.location.href = "${url}";
</script></body></html>`;

  const redirectPath = join(profileDir, 'redirect.html');
  writeFileSync(redirectPath, redirectPage);

  try {
    execSync(
      `firefox --headless --screenshot "${outputPath}" --window-size=${width},${height} -no-remote -profile "${profileDir}" "file://${redirectPath}"`,
      { timeout: 15000, stdio: 'pipe' }
    );
  } catch(e) {
    // Firefox sometimes exits with error but still creates the file
  }
}

async function main() {
  console.log('Logging in as tutor...');
  const tutorCookies = await login('tutor@student.supsi.ch', 'tutor123');
  console.log('Got tutor session');

  console.log('Logging in as manager...');
  const managerCookies = await login('manager@supsi.ch', 'manager123');
  console.log('Got manager session');

  // Screenshot login page (no auth needed)
  console.log('1/6 Login page...');
  const p1 = mkdtempSync(join(tmpdir(), 'ff-'));
  try {
    execSync(`firefox --headless --screenshot "${OUT}/01-login.png" --window-size=1280,800 -no-remote -profile "${p1}" "${BASE}/login"`, { timeout: 15000, stdio: 'pipe' });
  } catch(e) {}

  // For authenticated pages, use the redirect trick
  console.log('2/6 Tutor dashboard...');
  screenshot(`${BASE}/tutor`, `${OUT}/02-tutor-dashboard.png`, tutorCookies);

  console.log('3/6 Available requests...');
  screenshot(`${BASE}/tutor/available`, `${OUT}/03-richieste-disponibili.png`, tutorCookies);

  console.log('4/6 Manager dashboard...');
  screenshot(`${BASE}/manager`, `${OUT}/04-manager-dashboard.png`, managerCookies);

  console.log('5/6 Manager requests...');
  screenshot(`${BASE}/manager/requests`, `${OUT}/05-manager-richieste.png`, managerCookies);

  console.log('6/6 Manager reports...');
  screenshot(`${BASE}/manager/reports`, `${OUT}/06-manager-report.png`, managerCookies);

  console.log('Done! Screenshots in:', OUT);
}

main().catch(console.error);
