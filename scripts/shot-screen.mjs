import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

// Jump to any screen via the desktop dev sidebar and capture it.
//   node scripts/shot-screen.mjs Navigation [baseUrl]
const SCREEN = process.argv[2] ?? 'Navigation'
const BASE = process.argv[3] ?? 'http://localhost:5174/UK'
const PORT = 9249
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-shot-screen',
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
const errors = []
let id = 0
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data)
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
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
  const res = await send('Runtime.evaluate', { expression, returnByValue: true })
  return res.result?.result?.value ?? res.result?.value
}

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 2,
  mobile: false,
})
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

console.log(
  `select ${SCREEN}:`,
  await evaluate(`(() => {
    const el = Array.from(document.querySelectorAll('*')).find(
      (x) => x.children.length === 0 && x.textContent.trim() === ${JSON.stringify(SCREEN)})
    if (!el) return 'not found'
    ;(el.closest('label') ?? el).click()
    return 'clicked'
  })()`),
)
await sleep(2000)

const shot = await send('Page.captureScreenshot', {})
const out = `/tmp/screen-${SCREEN.toLowerCase().replace(/\s+/g, '-')}.png`
await writeFile(out, Buffer.from(shot.result?.result?.data ?? shot.result?.data, 'base64'))
console.log('shot:', out)
console.log('exceptions:', errors.length, errors.slice(0, 2))
chrome.kill()
