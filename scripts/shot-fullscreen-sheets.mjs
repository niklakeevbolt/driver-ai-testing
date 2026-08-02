import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9245
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-shots',
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
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return res.result?.result?.value ?? res.result?.value
}
const shot = async (path) => {
  const s = await send('Page.captureScreenshot', {})
  await writeFile(path, Buffer.from(s.result?.result?.data ?? s.result?.data, 'base64'))
}

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true })
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

const swipe = async (x, y0, y1) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 0 }] })
  for (let i = 1; i <= 20; i++) {
    await send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / 20, id: 0 }],
    })
    await sleep(16)
  }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await sleep(700)
}

// Home sheet → fullscreen
const handle = await evaluate(`(() => {
  const h = Array.from(document.querySelectorAll('div')).find(
    (d) => d.style && d.style.width === '60px' && d.style.height === '6px')
  const r = h.parentElement.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
})()`)
await swipe(handle.x, handle.y, handle.y - 480)
await shot('/tmp/sheet-home-fullscreen.png')
console.log('home fullscreen captured')

// Open Opportunities
console.log('open opps:', await evaluate(`(() => {
  const btns = Array.from(document.querySelectorAll('button'))
  const target = btns.find((b) => b.style && b.style.borderRadius === '24px' && b.style.width === '48px')
  if (!target) return 'not found'
  target.click()
  return 'clicked'
})()`))
await sleep(1200)
await shot('/tmp/sheet-opps-fullscreen.png')
console.log('opps fullscreen captured')

console.log(JSON.stringify(await evaluate(`(() => {
  const screen = document.querySelector('.screen')
  const sr = screen.getBoundingClientRect()
  const fabRow = Array.from(document.querySelectorAll('div')).find(
    (d) => d.style && d.style.zIndex === '10' && d.style.gap === '59px')
  const opps = Array.from(document.querySelectorAll('div')).find(
    (d) => d.style && d.style.zIndex === '60')
  const fabPoint = fabRow ? (() => { const r = fabRow.getBoundingClientRect(); return { x: r.left + 24, y: r.top + 24 } })() : null
  const hit = fabPoint ? document.elementFromPoint(fabPoint.x, fabPoint.y) : null
  return {
    oppsTop: opps ? Math.round(opps.getBoundingClientRect().top - sr.top) : null,
    oppsZ: opps ? opps.style.zIndex : null,
    fabTop: fabRow ? Math.round(fabRow.getBoundingClientRect().top - sr.top) : null,
    topmostAtFab: hit ? (hit.tagName + '.' + (hit.className || '')) : null,
  }
})()`, null, 2)))

cleanup()
