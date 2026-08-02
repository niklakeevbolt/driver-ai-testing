import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9261
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-preferences',
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
const logs = []
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data)
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    logs.push(msg.params.args.map((a) => a.value ?? a.description).join(' '))
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    logs.push('EXCEPTION ' + (msg.params.exceptionDetails?.exception?.description ?? ''))
  }
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
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return res.result?.result?.value ?? res.result?.value
}
const shot = async (path) => {
  const s = await send('Page.captureScreenshot', {})
  await writeFile(path, Buffer.from(s.result?.result?.data ?? s.result?.data, 'base64'))
}

await send('Runtime.enable')
// Match the Figma frame exactly so measurements line up 1:1.
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

await shot('/tmp/figref/impl-home.png')

const fab = await evaluate(`(() => {
  const b = document.querySelector('button[aria-label="Preferences"]')
  if (!b) return { error: 'no preferences fab' }
  const go = Array.from(document.querySelectorAll('button')).find((x) => x.textContent.trim() === 'Go online')
  const gr = go.getBoundingClientRect(), br = b.getBoundingClientRect()
  const bar = b.parentElement.getBoundingClientRect()
  const cs = getComputedStyle(go)
  b.click()
  return {
    goOnline: { x: Math.round(gr.x), w: Math.round(gr.width), h: Math.round(gr.height), bg: cs.backgroundColor, fs: cs.fontSize, r: cs.borderRadius },
    prefFab: { x: Math.round(br.x), w: Math.round(br.width), h: Math.round(br.height) },
    gap: Math.round(br.x - gr.right),
    barTopPad: Math.round(gr.top - bar.top),
    barBottomPad: Math.round(bar.bottom - br.bottom),
  }
})()`)
console.log('sticky area:', JSON.stringify(fab, null, 2))

await sleep(900)
await shot('/tmp/figref/impl-preferences.png')

const metrics = await evaluate(`(() => {
  const t = (s) => Array.from(document.querySelectorAll('p,span,button')).find((e) => e.textContent.trim() === s)
  const r = (e) => e ? (({x,y,width,height}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null
  const rows = Array.from(document.querySelectorAll('section')).map((s) => r(s))
  const chips = Array.from(document.querySelectorAll('button')).filter((b) => getComputedStyle(b).borderRadius === '8px').map((b) => r(b))
  const toggle = document.querySelector('[role=switch]')
  return {
    title: r(t('Preferences')),
    sections: rows,
    vehicleRow: r(t('Vehicle')?.closest('button')),
    homeRow: r(t('Home')?.parentElement?.parentElement),
    toggle: r(toggle),
    chips,
    scrollH: document.querySelector('.screen')?.firstElementChild?.scrollHeight,
  }
})()`)
console.log('preferences metrics:', JSON.stringify(metrics, null, 2))
if (logs.length) console.log('console errors:', logs.slice(0, 5))

cleanup()
