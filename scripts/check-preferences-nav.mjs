import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9262
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-prefs-nav',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
const cleanup = () => { try { chrome.kill() } catch {} }
process.on('exit', cleanup)

let targets
for (let attempt = 0; attempt < 12; attempt++) {
  await sleep(500)
  try {
    targets = await new Promise((resolve, reject) => {
      http
        .get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
          let data = ''
          res.on('data', (chunk) => (data += chunk))
          res.on('end', () => resolve(JSON.parse(data)))
        })
        .on('error', reject)
    })
    break
  } catch { /* retry */ }
}
if (!targets) { console.error('CDP failed'); cleanup(); process.exit(1) }

const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
const pending = new Map()
let id = 0
const errors = []
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data)
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '))
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push('EXCEPTION ' + (msg.params.exceptionDetails?.exception?.description ?? ''))
  }
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
})
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }))
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id
    pending.set(next, resolve)
    ws.send(JSON.stringify({ id: next, method, params }))
  })
const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return res.result?.result?.value ?? res.result?.value
}

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true })
await send('Emulation.setTouchEmulationEnabled', { enabled: true })
await send('Page.navigate', { url: `${BASE}?v=${Date.now()}` })
await sleep(2500)
await evaluate(`
  (() => {
    const i = document.querySelector('input[type=password]');
    if (!i) return;
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(i, 'driver-ai');
    i.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('button[type=submit]').click();
  })()
`)
await sleep(9000)

const label = `(() => {
  const go = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Go online')
  const title = Array.from(document.querySelectorAll('p')).find((p) => p.textContent.trim() === 'Preferences')
  return { goOnlineText: go ? go.textContent.trim() : null, onPreferences: Boolean(title), hasMap: Boolean(document.querySelector('.leaflet-container')) }
})()`

const start = await evaluate(label)

// Go online must be inert.
await evaluate(`Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Go online').click()`)
await sleep(700)
const afterGoOnline = await evaluate(label)

await evaluate(`document.querySelector('button[aria-label="Preferences"]').click()`)
await sleep(900)
const afterPrefs = await evaluate(label)

const toggleBefore = await evaluate(`document.querySelector('[role=switch]').getAttribute('aria-checked')`)
await evaluate(`document.querySelector('[role=switch]').click()`)
await sleep(400)
const toggleAfter = await evaluate(`document.querySelector('[role=switch]').getAttribute('aria-checked')`)

await evaluate(`document.querySelector('button[aria-label="Back"]').click()`)
await sleep(900)
const afterBack = await evaluate(label)

const results = {
  'go online inert': afterGoOnline.goOnlineText === 'Go online' && !afterGoOnline.onPreferences && afterGoOnline.hasMap,
  'starts on home': start.hasMap && !start.onPreferences,
  'fab opens preferences': afterPrefs.onPreferences && !afterPrefs.hasMap,
  'auto-accept toggles': toggleBefore === 'true' && toggleAfter === 'false',
  'back returns home': afterBack.hasMap && !afterBack.onPreferences,
  'no console errors': errors.length === 0,
}
for (const [k, v] of Object.entries(results)) console.log(`${v ? 'PASS' : 'FAIL'}  ${k}`)
if (errors.length) console.log('errors:', errors.slice(0, 5))

cleanup()
process.exit(Object.values(results).every(Boolean) ? 0 : 1)
