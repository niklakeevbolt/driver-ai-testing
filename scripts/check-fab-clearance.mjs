import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/UK'
const PORT = 9246
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-fab-clearance',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
await sleep(1800)

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
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return res.result?.result?.value ?? res.result?.value
}
const shot = async (path) => {
  const s = await send('Page.captureScreenshot', {})
  await writeFile(path, Buffer.from(s.result?.result?.data ?? s.result?.data, 'base64'))
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
await sleep(3500)
await evaluate(`
  (() => {
    const i = document.querySelector('input[type=password]');
    if (!i) return 'no-gate';
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(i, 'bolt2026');
    i.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('button[type=submit]').click();
    return 'gated';
  })()
`)
await sleep(7000)

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

const round = (n) => Math.round(n * 10) / 10
const near = (a, b, tol = 2) => Math.abs(a - b) <= tol
const log = (label, ok, detail = '') =>
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`)

// 1. Fullscreen home sheet: title must clear the FAB row without a big gap.
const handle = await evaluate(`(() => {
  const h = Array.from(document.querySelectorAll('div')).find(
    (d) => d.style && d.style.width === '60px' && d.style.height === '6px')
  if (!h) return null
  const r = h.parentElement.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
})()`)
if (!handle) {
  console.log('FAIL  sheet handle not found')
} else {
  await swipe(handle.x, handle.y, handle.y - 520)
  const fs = await evaluate(`(() => {
    const fabs = Array.from(document.querySelectorAll('.fab'))
    const fabBottom = Math.max(...fabs.map((f) => f.getBoundingClientRect().bottom))
    const title = Array.from(document.querySelectorAll('div')).find(
      (d) => /per offer|demand in your area/.test(d.textContent) && d.children.length === 0)
    return {
      fabBottom: Math.round(fabBottom),
      titleTop: title ? Math.round(title.getBoundingClientRect().top) : null,
    }
  })()`)
  await shot('/tmp/fab-clearance-fullscreen.png')
  console.log(JSON.stringify(fs))
  log('fullscreen title clears FAB row', fs.titleTop > fs.fabBottom, `gap ${fs.titleTop - fs.fabBottom}px`)
  log('gap is tight (< 60px)', fs.titleTop - fs.fabBottom < 60)
  await swipe(handle.x, 200, 700)
  await sleep(600)
}

// 2. Expanded earnings island: top card aligns with the 16px inset.
await evaluate(`(() => {
  const b = Array.from(document.querySelectorAll('button')).find(
    (x) => x.style && x.style.width === '113px')
  if (b) b.click()
  return !!b
})()`)
await sleep(900)
const island = await evaluate(`(() => {
  const cards = Array.from(document.querySelectorAll('div')).filter(
    (d) => d.style && d.style.zIndex === '30' && d.style.borderRadius === '28px')
  if (!cards.length) return null
  const r = cards[0].getBoundingClientRect()
  return { top: ${round.toString() ? 'Math.round' : 'Math.round'}(r.top), left: Math.round(r.left), right: Math.round(393 - r.right) }
})()`)
await shot('/tmp/fab-clearance-island.png')
console.log(JSON.stringify(island))
log('island main card top = 16', island && near(island.top, 16), `got ${island?.top}`)
log('island side margins equal', island && near(island.left, island.right), `${island?.left}/${island?.right}`)

// 3. Sidebar + hub grow from their FAB centres.
await evaluate(
  `(() => { const s = document.querySelector('div[style*="z-index: 28"]'); if (s) s.click(); })()`,
)
await sleep(700)
const origins = await evaluate(`(() => {
  const grab = () => Array.from(document.querySelectorAll('div'))
    .filter((d) => d.style && d.style.zIndex === '100')
    .map((d) => getComputedStyle(d).transformOrigin)
  return grab()
})()`)
console.log('open-panel transform origins (idle):', JSON.stringify(origins))

await evaluate(`document.querySelector('.fab-profile')?.click()`)
await sleep(200)
const sidebarOrigin = await evaluate(`(() => {
  const d = Array.from(document.querySelectorAll('div')).find((x) => x.style && x.style.zIndex === '100')
  return d ? getComputedStyle(d).transformOrigin : null
})()`)
console.log('sidebar origin:', sidebarOrigin)
log('sidebar grows from profile FAB centre (40,40)', sidebarOrigin === '40px 40px')
await sleep(900)
await evaluate(`(() => {
  const b = Array.from(document.querySelectorAll('button[aria-label="Close profile"]'))[0]
  if (b) b.click()
})()`)
await sleep(900)

await evaluate(`(() => {
  const fabs = Array.from(document.querySelectorAll('.fab'))
  const inbox = fabs.find((f) => !f.classList.contains('fab-profile'))
  if (inbox) inbox.click()
})()`)
await sleep(200)
const hubOrigin = await evaluate(`(() => {
  const d = Array.from(document.querySelectorAll('div')).find((x) => x.style && x.style.zIndex === '100')
  return d ? getComputedStyle(d).transformOrigin : null
})()`)
console.log('hub origin:', hubOrigin)
log('hub grows from inbox FAB centre (353,40)', hubOrigin === '353px 40px')

chrome.kill()
