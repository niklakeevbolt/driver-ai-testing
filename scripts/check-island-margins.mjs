import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:4177/'
const PORT = 9231
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-margins',
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

await evaluate(`
  const i = document.querySelector('input[type=password]');
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(i, 'driver-ai');
  i.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('button[type=submit]').click();
`)
await sleep(12000)

console.log(
  'open:',
  await evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.trim() === '208.00€',
      )
      if (!btn) return 'missing'
      btn.click()
      return 'ok'
    })()
  `),
)
await sleep(1500)

const report = await evaluate(`
  (() => {
    const cards = Array.from(document.querySelectorAll('div')).filter(
      (d) => d.style.borderRadius === '28px' && d.style.boxShadow,
    )
    const metrics = cards.slice(0, 3).map((c) => {
      const r = c.getBoundingClientRect()
      return {
        left: Math.round(r.left),
        right: Math.round(innerWidth - r.right),
        width: Math.round(r.width),
        equal: Math.abs(r.left - (innerWidth - r.right)) <= 1,
        text: c.innerText.slice(0, 48).replace(/\\n/g, ' | '),
      }
    })
    return {
      viewport: innerWidth,
      hasWeeklyGoal: document.body.innerText.includes('Weekly goal'),
      cards: metrics,
    }
  })()
`)
console.log(JSON.stringify(report, null, 2))

const shot = await send('Page.captureScreenshot', {})
await writeFile(
  '/tmp/island-margins.png',
  Buffer.from(shot.result?.result?.data ?? shot.result?.data, 'base64'),
)
chrome.kill()
