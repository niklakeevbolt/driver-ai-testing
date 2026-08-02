import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9263
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-demand-prefs',
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
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
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

const probe = `(() => {
  const title = Array.from(document.querySelectorAll('p')).find((p) =>
    p.textContent.includes('Earn +3') || p.textContent.includes('Medium demand') || p.textContent.includes('Demand is'))
  const surgePills = Array.from(document.querySelectorAll('.spw')).map((el) => ({
    zone: el.getAttribute('data-zone'),
    text: el.textContent.trim(),
    opacity: getComputedStyle(el).opacity,
  }))
  const bars = Array.from(document.querySelectorAll('[style*="flex-end"] > div')).filter((d) => d.style.flex === '1')
  const colors = bars.slice(20, 40).map((d) => getComputedStyle(d).backgroundColor)
  const orangeish = colors.filter((c) => c.includes('255') || c.includes('warning') || /rgb\\(\\s*2[0-9]{2}/.test(c)).length
  return {
    title: title?.textContent?.trim() ?? null,
    surgePills,
    visiblePills: surgePills.filter((p) => Number(p.opacity) > 0.5).map((p) => p.zone + ':' + p.text),
    barSample: colors.slice(0, 8),
  }
})()`

const before = await evaluate(probe)
await shot('/tmp/figref/demand-before.png')
console.log('before:', JSON.stringify(before, null, 2))

await evaluate(`document.querySelector('button[aria-label="Preferences"]').click()`)
await sleep(900)
await evaluate(`document.querySelector('button[aria-label="Back"]').click()`)
await sleep(1200)

const after = await evaluate(probe)
await shot('/tmp/figref/demand-after.png')
console.log('after:', JSON.stringify(after, null, 2))

const results = {
  'initial title': before.title === 'Earn +3€ per offer',
  'after title': after.title === 'Medium demand in your area',
  'initial has mitte': before.visiblePills.some((p) => p.startsWith('mitte:')),
  'after no mitte': !after.visiblePills.some((p) => p.startsWith('mitte:')),
  'after still has other zones': after.visiblePills.some((p) => p.startsWith('friedrichshain:') || p.startsWith('kreuzberg:')),
}

for (const [k, v] of Object.entries(results)) console.log(`${v ? 'PASS' : 'FAIL'}  ${k}`)
cleanup()
process.exit(Object.values(results).every(Boolean) ? 0 : 1)
