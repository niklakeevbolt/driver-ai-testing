import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9232
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-profile-fabs',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
await sleep(1600)

const targets = await new Promise((resolve, reject) => {
  http
    .get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(JSON.parse(data)))
    })
    .on('error', reject)
})

const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
const pending = new Map()
let id = 0
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
})
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }))
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id
    pending.set(next, resolve)
    ws.send(JSON.stringify({ id: next, method, params }))
  })
const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true })
  return res.result?.result?.value ?? res.result?.value
}

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 393,
  height: 852,
  deviceScaleFactor: 2,
  mobile: true,
})
await send('Emulation.setTouchEmulationEnabled', { enabled: true })
await send('Page.navigate', { url: `${BASE}?v=${Date.now()}` })
await sleep(3000)

// The password gate only exists on the deployed build; skip it when absent.
await evaluate(`
  (() => {
    const i = document.querySelector('input[type=password]');
    if (!i) return 'no-gate';
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(i, 'driver-ai');
    i.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('button[type=submit]').click();
    return 'gated';
  })()
`)
await sleep(10000)

const FAB_STYLE = `(el) => {
  const s = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  return {
    size: Math.round(r.width) + 'x' + Math.round(r.height),
    radius: s.borderRadius,
    background: s.backgroundColor,
    boxShadow: s.boxShadow,
  }
}`

const home = await evaluate(`
  (() => {
    const read = ${FAB_STYLE}
    const fabs = Array.from(document.querySelectorAll('.fab'))
    return fabs.map((f) => ({ label: f.className, ...read(f) }))
  })()
`)
console.log('home FABs:', JSON.stringify(home, null, 2))

console.log(
  'open profile:',
  await evaluate(`document.querySelector('.fab-profile')?.click() ?? 'missing', 'ok'`),
)
await sleep(1200)

const profile = await evaluate(`
  (() => {
    const read = ${FAB_STYLE}
    const btns = Array.from(document.querySelectorAll('button[aria-label]')).filter((b) =>
      ['Close profile', 'Profile settings'].includes(b.getAttribute('aria-label')),
    )
    return btns.map((b) => ({
      label: b.getAttribute('aria-label'),
      isFab: b.classList.contains('fab'),
      ...read(b),
    }))
  })()
`)
console.log('profile buttons:', JSON.stringify(profile, null, 2))

const ref = home.find((f) => !f.label.includes('profile')) ?? home[0]
const matches = profile.every(
  (p) =>
    p.isFab &&
    p.size === ref.size &&
    p.radius === ref.radius &&
    p.background === ref.background &&
    p.boxShadow === ref.boxShadow,
)
console.log('\nmatches home FAB:', matches)

const shot = await send('Page.captureScreenshot', {})
await writeFile(
  '/tmp/profile-fabs.png',
  Buffer.from(shot.result?.result?.data ?? shot.result?.data, 'base64'),
)
chrome.kill()
