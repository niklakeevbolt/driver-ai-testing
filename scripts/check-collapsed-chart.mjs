import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9244
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// Short → tall: SE-class, mini, 14, Pro Max.
const HEIGHTS = [667, 780, 852, 932]

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-collapsed-chart',
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
if (!targets) {
  console.error('Chrome CDP failed to start')
  cleanup()
  process.exit(1)
}

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
  const res = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  return res.result?.result?.value ?? res.result?.value
}

const setViewport = (height) =>
  send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height,
    deviceScaleFactor: 2,
    mobile: true,
  })

await send('Runtime.enable')
await setViewport(852)
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
await sleep(12000)

// FAB row bottom is 92; the footer occupies the bottom 92px.
const REPORT = `(() => {
  const chart = document.querySelector('[data-demand-chart]')
    || (() => {
      const label = Array.from(document.querySelectorAll('p')).find((p) =>
        p.textContent.includes('Demand is moderate'))
      return label ? label.parentElement.querySelector('div[style*="rgba(0, 45, 30"]') : null
    })()
  if (!chart) return { error: document.body.innerText.slice(0, 160) }
  const screen = document.querySelector('.screen')
  const r = chart.getBoundingClientRect()
  const sr = screen.getBoundingClientRect()
  const footerTop = sr.bottom - 92
  return {
    viewport: Math.round(sr.height),
    chartTop: Math.round(r.top - sr.top),
    chartBottom: Math.round(r.bottom - sr.top),
    footerTop: Math.round(footerTop - sr.top),
    fullyVisible: r.top >= sr.top && r.bottom <= footerTop + 0.5,
  }
})()`

const collapse = async () =>
  evaluate(`(async () => {
    const handle = Array.from(document.querySelectorAll('div')).find(
      (d) => d.style && d.style.width === '60px' && d.style.height === '6px',
    )
    const bar = handle.parentElement
    const r = bar.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y0 = r.top + r.height / 2
    const screen = document.querySelector('.screen')
    bar.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y0 }))
    for (let i = 1; i <= 16; i++) {
      screen.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y0 + i * 20 }))
      await new Promise((r) => setTimeout(r, 12))
    }
    screen.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y0 + 400 }))
    await new Promise((r) => setTimeout(r, 700))
  })()`)

let allOk = true
for (const height of HEIGHTS) {
  await setViewport(height)
  await sleep(900)
  await collapse()
  const report = await evaluate(REPORT)
  const ok = report.fullyVisible === true
  if (!ok) allOk = false
  console.log(`${height}px →`, JSON.stringify(report), ok ? 'OK' : 'FAIL')
}

console.log('\nPASS:', allOk)
cleanup()
process.exit(allOk ? 0 : 1)
