import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/UK'
const PORT = 9247
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-tasks-card',
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
  const res = await send('Runtime.evaluate', { expression, returnByValue: true })
  return res.result?.result?.value ?? res.result?.value
}

await send('Runtime.enable')
// Desktop viewport so the dev sidebar is available to switch the hub scenario.
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
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
  'switch to With tasks:',
  await evaluate(`(() => {
    const label = Array.from(document.querySelectorAll('*')).find(
      (el) => el.children.length === 0 && el.textContent.trim() === 'With tasks')
    if (!label) return 'not found'
    ;(label.closest('label') ?? label).click()
    return 'clicked'
  })()`),
)
await sleep(1200)

const geo = await evaluate(`(() => {
  const screen = document.querySelector('.screen')
  const sr = screen.getBoundingClientRect()
  const fabs = Array.from(document.querySelectorAll('.fab'))
  const fabBottom = Math.max(...fabs.map((f) => f.getBoundingClientRect().bottom)) - sr.top
  const card = Array.from(document.querySelectorAll('div')).find(
    (d) => d.style && d.style.zIndex === '8' && d.style.width === '341px')
  if (!card) return { error: 'no tasks card' }
  const cr = card.getBoundingClientRect()
  return {
    fabBottom: Math.round(fabBottom),
    cardTop: Math.round(cr.top - sr.top),
    gap: Math.round(cr.top - sr.top - fabBottom),
  }
})()`)
console.log(JSON.stringify(geo))
console.log(`${geo.gap === 16 ? 'PASS' : 'FAIL'}  tasks card sits 16px below the FAB row`)

const shot = await send('Page.captureScreenshot', {})
await writeFile(
  '/tmp/tasks-card.png',
  Buffer.from(shot.result?.result?.data ?? shot.result?.data, 'base64'),
)
chrome.kill()
