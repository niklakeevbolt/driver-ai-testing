import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:4176/'
const PORT = 9229
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-island',
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
const errors = []
let id = 0
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push((msg.params.exception.description ?? '').split('\n')[0])
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

await evaluate(
  `const i=document.querySelector('input[type=password]');
   Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(i,'driver-ai');
   i.dispatchEvent(new Event('input',{bubbles:true}));
   document.querySelector('button[type=submit]').click();`,
)
await sleep(12000)

// The collapsed island is the button showing today's earnings.
const opened = await evaluate(
  `(() => {
     const btn = Array.from(document.querySelectorAll('button')).find(
       (b) => b.textContent.trim() === '208.00€',
     )
     if (!btn) return 'no island button'
     btn.click()
     return 'clicked'
   })()`,
)
console.log('open island:', opened)
await sleep(1200)

// Expand the last-ride card so the route markers render.
await evaluate(
  `(() => {
     const card = Array.from(document.querySelectorAll('div')).find((d) =>
       d.textContent.includes('Last ride •') && d.style.borderRadius === '28px',
     )
     card?.click()
   })()`,
)
await sleep(1200)

const report = await evaluate(
  `(() => {
     const imgs = Array.from(document.querySelectorAll('img'))
     return {
       total: imgs.length,
       broken: imgs
         .filter((i) => !i.complete || i.naturalWidth === 0)
         .map((i) => i.getAttribute('src')),
       loaded: imgs.map((i) => ({
         src: (i.currentSrc || i.src).split('/').pop(),
         natural: i.naturalWidth + 'x' + i.naturalHeight,
         rendered: Math.round(i.getBoundingClientRect().width) + 'x' +
           Math.round(i.getBoundingClientRect().height),
       })),
     }
   })()`,
)
console.log(JSON.stringify(report, null, 2))
console.log('exceptions:', errors.length, errors.slice(0, 2))

const shot = await send('Page.captureScreenshot', {})
await writeFile(
  '/tmp/island-expanded.png',
  Buffer.from(shot.result?.result?.data ?? shot.result?.data, 'base64'),
)
chrome.kill()
