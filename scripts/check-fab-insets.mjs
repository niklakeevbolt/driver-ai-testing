import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/UK'
const PORT = 9245
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-fab-insets',
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

// `--desktop` exercises the phone-frame layout, where the screen is narrower
// than the viewport, to confirm the insets are measured against the screen.
const DESKTOP = process.argv.includes('--desktop')

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: DESKTOP ? 1440 : 393,
  height: DESKTOP ? 900 : 852,
  deviceScaleFactor: DESKTOP ? 1 : 2,
  mobile: !DESKTOP,
})
await send('Emulation.setTouchEmulationEnabled', { enabled: !DESKTOP })
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
await sleep(6000)

const geometry = await evaluate(`
  (() => {
    const profileEl = document.querySelector('.fab-profile')
    // The FAB row is absolutely positioned, so step past it to the screen.
    const screen = document.querySelector('.screen') ?? profileEl?.parentElement?.offsetParent
    const frame = (screen ?? document.body).getBoundingClientRect()
    const profile = profileEl?.getBoundingClientRect()
    const fabs = Array.from(document.querySelectorAll('.fab'))
    const inbox = fabs.find((f) => !f.classList.contains('fab-profile'))?.getBoundingClientRect()
    const pill = Array.from(document.querySelectorAll('button')).find((b) =>
      /^[£R]?\\s?[\\d.,]+\\s?(lei)?$/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 100 && b.getBoundingClientRect().top < 200,
    )?.getBoundingClientRect()
    const round = (n) => Math.round(n * 10) / 10
    return {
      frame: { left: round(frame.left), top: round(frame.top), right: round(frame.right), width: round(frame.width) },
      profile: profile && { left: round(profile.left - frame.left), top: round(profile.top - frame.top), w: round(profile.width) },
      inbox: inbox && { right: round(frame.right - inbox.right), top: round(inbox.top - frame.top), w: round(inbox.width) },
      pill: pill && {
        left: round(pill.left - frame.left),
        right: round(frame.right - pill.right),
        top: round(pill.top - frame.top),
        w: round(pill.width),
      },
    }
  })()
`)

console.log(JSON.stringify(geometry, null, 2))

const { profile, inbox, pill } = geometry
const near = (a, b, tol = 1.5) => Math.abs(a - b) <= tol
const results = [
  ['profile left inset = 16', profile && near(profile.left, 16)],
  ['profile top inset = 16', profile && near(profile.top, 16)],
  ['inbox right inset = 16', inbox && near(inbox.right, 16)],
  ['inbox top inset = 16', inbox && near(inbox.top, 16)],
  ['earnings pill top = 16', pill && near(pill.top, 16)],
  ['earnings pill centred', pill && near(pill.left, pill.right)],
]
for (const [label, ok] of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)

const shot = await send('Page.captureScreenshot', {})
await writeFile(
  '/tmp/fab-insets.png',
  Buffer.from(shot.result?.result?.data ?? shot.result?.data, 'base64'),
)
console.log('\nshot: /tmp/fab-insets.png')
chrome.kill()
