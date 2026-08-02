import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9241
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-sheet-scroll-2',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

const cleanup = () => {
  try { chrome.kill() } catch {}
}
process.on('exit', cleanup)

await sleep(1600)

let targets
for (let attempt = 0; attempt < 10; attempt++) {
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
  } catch {
    await sleep(500)
  }
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
await send('Emulation.setDeviceMetricsOverride', {
  width: 393,
  height: 852,
  deviceScaleFactor: 2,
  mobile: true,
})
await send('Page.navigate', { url: `${BASE}?v=${Date.now()}` })
await sleep(2500)

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
await sleep(12000)

const READ = `(() => {
  const label = Array.from(document.querySelectorAll('p')).find((p) =>
    p.textContent.includes('Demand is moderate'),
  )
  if (!label) return { error: 'no label', text: document.body.innerText.slice(0, 240) }
  let node = label
  while (node && node !== document.body) {
    const s = getComputedStyle(node)
    if (
      (s.overflowY === 'auto' || s.overflowY === 'hidden' || s.overflowY === 'scroll') &&
      node.clientHeight > 100
    ) {
      return {
        overflowY: s.overflowY,
        touchAction: s.touchAction,
        scrollHeight: node.scrollHeight,
        clientHeight: Math.round(node.clientHeight),
        canScroll: node.scrollHeight > node.clientHeight + 2,
        sheetTop: Math.round(node.parentElement.getBoundingClientRect().top),
      }
    }
    node = node.parentElement
  }
  return { error: 'no scroller' }
})()`

const mid = await evaluate(READ)
console.log('mid-state:', JSON.stringify(mid, null, 2))

const drag = await evaluate(`(async () => {
  const handle = Array.from(document.querySelectorAll('div')).find(
    (d) => d.style && d.style.width === '60px' && d.style.height === '6px',
  )
  if (!handle) return 'no handle'
  const bar = handle.parentElement
  const r = bar.getBoundingClientRect()
  const x = r.left + r.width / 2
  const y0 = r.top + r.height / 2
  const screen = document.querySelector('.screen') || document.body
  bar.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y0 }))
  for (let i = 1; i <= 20; i++) {
    screen.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y0 - i * 25 }))
    await new Promise((r) => setTimeout(r, 16))
  }
  screen.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y0 - 500 }))
  await new Promise((r) => setTimeout(r, 700))
  return 'ok'
})()`)
console.log('drag:', drag)

const full = await evaluate(READ)
console.log('fullscreen:', JSON.stringify(full, null, 2))

const ok =
  mid?.overflowY === 'hidden' &&
  full?.overflowY === 'auto' &&
  (full?.sheetTop ?? 99) < 20

console.log('\nPASS:', ok)
cleanup()
process.exit(ok ? 0 : 1)
