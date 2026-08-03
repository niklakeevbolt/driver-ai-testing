import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/UK'
const PORT = 9248
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-opps-sticky',
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

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true })
await send('Emulation.setTouchEmulationEnabled', { enabled: true })
await send('Page.navigate', { url: `${BASE}?v=${Date.now()}` })
await sleep(2500)
await evaluate(`
  (() => {
    const i = document.querySelector('input[type=password]');
    if (!i) return;
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(i, 'bolt2026');
    i.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('button[type=submit]').click();
  })()
`)
await sleep(12000)

await evaluate(`(() => {
  const b = Array.from(document.querySelectorAll('button')).find(
    (x) => x.style && x.style.borderRadius === '24px' && x.style.width === '48px')
  b.click()
})()`)
await sleep(1200)

// Day chips read as calendar dates, e.g. "Aug 3".
const DAY_CHIP = `Array.from(document.querySelectorAll('button')).find((b) =>
  /^[A-Z][a-z]{2} \\d{1,2}$/.test(b.textContent.trim()))`

const PROBE = `(() => {
  const mon = ${DAY_CHIP}
  if (!mon) return { error: 'no day strip' }
  const bar = mon.parentElement.parentElement
  const sheet = Array.from(document.querySelectorAll('div')).find(
    (d) => d.style && d.style.zIndex === '6' && d.style.position === 'absolute')
  const scroller = bar.closest('div[style*="overflow-x"]') || (() => {
    let n = bar
    while (n) { const s = getComputedStyle(n); if (s.overflowY === 'auto' || s.overflowY === 'hidden') return n; n = n.parentElement }
    return null
  })()
  const fabs = Array.from(document.querySelectorAll('.fab'))
  const fabRow = fabs.length ? fabs[0].parentElement : null
  const sr = document.querySelector('.screen').getBoundingClientRect()
  return {
    position: getComputedStyle(bar).position,
    barTop: Math.round(bar.getBoundingClientRect().top - sr.top),
    scrollerTop: scroller ? Math.round(scroller.getBoundingClientRect().top - sr.top) : null,
    scrollTop: scroller ? Math.round(scroller.scrollTop) : null,
    fabBottom: fabRow ? Math.round(fabRow.getBoundingClientRect().bottom - sr.top) : null,
    sheetTop: sheet ? Math.round(sheet.getBoundingClientRect().top - sr.top) : null,
  }
})()`

const before = await evaluate(PROBE)
console.log('before scroll:', JSON.stringify(before))

await evaluate(`(() => {
  const mon = ${DAY_CHIP}
  let n = mon
  while (n) { const s = getComputedStyle(n); if (s.overflowY === 'auto') { n.scrollTop = 400; return } ; n = n.parentElement }
})()`)
await sleep(600)

const after = await evaluate(PROBE)
console.log('after scroll: ', JSON.stringify(after))

const s = await send('Page.captureScreenshot', {})
await writeFile('/tmp/opps-sticky.png', Buffer.from(s.result?.result?.data ?? s.result?.data, 'base64'))

const ok =
  after.position === 'sticky' &&
  after.scrollTop > 100 &&
  after.barTop === after.scrollerTop &&
  after.barTop >= after.fabBottom

console.log('\nPASS:', ok)
cleanup()
process.exit(ok ? 0 : 1)
