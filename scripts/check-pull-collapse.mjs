import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9243
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-pull-collapse-2',
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

await send('Runtime.enable')
await send('Input.setIgnoreInputEvents', { ignore: false })
await send('Emulation.setDeviceMetricsOverride', {
  width: 393,
  height: 852,
  deviceScaleFactor: 2,
  mobile: true,
})
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

const sheetInfo = async () =>
  evaluate(`(() => {
    const label = Array.from(document.querySelectorAll('p')).find((p) =>
      p.textContent.includes('Demand is moderate'),
    )
    if (!label) return { error: document.body.innerText.slice(0, 200) }
    let scroller = label
    while (scroller && scroller !== document.body) {
      const s = getComputedStyle(scroller)
      if ((s.overflowY === 'auto' || s.overflowY === 'hidden') && scroller.clientHeight > 100) {
        return {
          sheetTop: Math.round(scroller.parentElement.getBoundingClientRect().top),
          scrollTop: scroller.scrollTop,
          overflowY: s.overflowY,
        }
      }
      scroller = scroller.parentElement
    }
    return { error: 'no scroller' }
  })()`)

const handlePoint = async () =>
  evaluate(`(() => {
    const handle = Array.from(document.querySelectorAll('div')).find(
      (d) => d.style && d.style.width === '60px' && d.style.height === '6px',
    )
    if (!handle) return null
    const r = handle.parentElement.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  })()`)

const contentPoint = async () =>
  evaluate(`(() => {
    const label = Array.from(document.querySelectorAll('p')).find((p) =>
      p.textContent.includes('Demand is moderate'),
    )
    let scroller = label
    while (scroller && scroller !== document.body) {
      const s = getComputedStyle(scroller)
      if ((s.overflowY === 'auto' || s.overflowY === 'hidden') && scroller.clientHeight > 100) {
        const r = scroller.getBoundingClientRect()
        scroller.scrollTop = 0
        return { x: r.left + r.width / 2, y: r.top + 100 }
      }
      scroller = scroller.parentElement
    }
    return null
  })()`)

async function swipe(x, y0, y1) {
  await send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: y0, id: 0 }],
  })
  const steps = 20
  for (let i = 1; i <= steps; i++) {
    const y = y0 + ((y1 - y0) * i) / steps
    await send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y, id: 0 }],
    })
    await sleep(16)
  }
  await send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await sleep(600)
}

console.log('initial:', await sheetInfo())

const h = await handlePoint()
console.log('handle:', h)
await swipe(h.x, h.y, h.y - 480)
console.log('after expand:', await sheetInfo())

const c = await contentPoint()
console.log('content:', c)
await swipe(c.x, c.y, c.y + 300)
console.log('after pull-down:', await sheetInfo())

const after = await sheetInfo()
const ok = after.sheetTop >= 400 && after.sheetTop <= 500
console.log('\nPASS:', ok)
cleanup()
process.exit(ok ? 0 : 1)
