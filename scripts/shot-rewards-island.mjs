import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9265
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-rewards-island',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
const cleanup = () => {
  try {
    chrome.kill()
  } catch {
    /* already gone */
  }
}
process.on('exit', cleanup)
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
await sleep(3000)
await evaluate(
  `const i=document.querySelector('input[type=password]');
   Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(i,'driver-ai');
   i.dispatchEvent(new Event('input',{bubbles:true}));
   document.querySelector('button[type=submit]').click();`,
)
await sleep(12000)

await evaluate(
  `Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === '208.00€')?.click()`,
)
await sleep(1200)
await evaluate(
  `(() => {
     const card = Array.from(document.querySelectorAll('div')).find(
       (d) => d.textContent.includes('Bolt Rewards') && d.style.borderRadius === '28px',
     )
     card?.click()
   })()`,
)
await sleep(1200)

await shot('/tmp/figref/island-rewards.png')
const island = await evaluate(
  `(() => {
     const card = Array.from(document.querySelectorAll('div')).find(
       (d) => d.textContent.includes('Bolt Rewards') && d.style.borderRadius === '28px',
     )
     const fill = card?.querySelector('div[style*="border-radius: 0px 4px 4px 0px"]')
     const track = fill?.parentElement
     const text = card?.innerText ?? ''
     return {
       text,
       points: Number((text.match(/^\\s*(\\d+)/) ?? [])[1]),
       ratio: fill && track
         ? +(fill.getBoundingClientRect().width / track.getBoundingClientRect().width).toFixed(3)
         : null,
     }
   })()`,
)

// Close the island, then open Profile → Rewards for the same numbers.
await evaluate(
  `Array.from(document.querySelectorAll('button')).find(
     (b) => b.getAttribute('aria-label') === 'Close' || b.textContent.trim() === '✕',
   )?.click() ?? document.querySelector('button[aria-label*="ismiss"]')?.click()`,
)
await sleep(800)
await evaluate(`document.querySelector('.fab-profile')?.click()`)
await sleep(1200)
await evaluate(
  `Array.from(document.querySelectorAll('button')).find(
     (b) => b.textContent.trim() === 'Rewards',
   )?.click()`,
)
await sleep(1200)
await shot('/tmp/figref/profile-rewards.png')

const profile = await evaluate(
  `(() => {
     const tip = Array.from(document.querySelectorAll('span')).find((s) =>
       /^\\d+ points$/.test(s.textContent.trim()),
     )
     const track = document.querySelector('div[class*="top-[42px]"]')
     const fill = track?.querySelector('div[class*="bg-secondary"]')
     return {
       points: Number((tip?.textContent.match(/\\d+/) ?? [])[0]),
       ratio: fill && track
         ? +(fill.getBoundingClientRect().width / track.getBoundingClientRect().width).toFixed(3)
         : null,
     }
   })()`,
)

console.log('island :', JSON.stringify(island))
console.log('profile:', JSON.stringify(profile))
const checks = [
  ['points match', island.points === profile.points && Number.isFinite(island.points)],
  ['fill ratio matches', island.ratio !== null && island.ratio === profile.ratio],
  ['next tier copy', /Earn 23 more points to achieve Gold/.test(island.text)],
  ['no exceptions', errors.length === 0],
]
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
if (errors.length) console.log(errors.slice(0, 3))
cleanup()
process.exit(checks.every(([, ok]) => ok) ? 0 : 1)
