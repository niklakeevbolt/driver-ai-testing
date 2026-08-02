import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:5174/'
const PORT = 9271
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const MARKETS = ['UK', 'RO', 'ZA']

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/dai-countries',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
const cleanup = () => {
  try {
    chrome.kill()
  } catch {
    /* */
  }
}
process.on('exit', cleanup)
await sleep(1600)

const targets = await new Promise((resolve, reject) => {
  http
    .get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
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
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return res.result?.result?.value ?? res.result?.value
}

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 393,
  height: 852,
  deviceScaleFactor: 2,
  mobile: true,
})

const unlock = async () => {
  await evaluate(
    `(() => {
      const i = document.querySelector('input[type=password]');
      if (!i) return;
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(i,'bolt2026');
      i.dispatchEvent(new Event('input',{bubbles:true}));
      document.querySelector('button[type=submit]')?.click();
    })()`,
  )
  await sleep(9000)
}

const results = []
for (const market of MARKETS) {
  errors.length = 0
  const url = `${BASE.replace(/\/$/, '')}/${market}?v=${Date.now()}`
  await send('Page.navigate', { url })
  await sleep(2500)
  await unlock()

  const report = await evaluate(
    `(() => {
      const body = document.body.innerText
      const leaflet = document.querySelector('.leaflet-container')
      const mapCenter = leaflet ? window.__mapProbe : null
      return {
        hasOfferTitle: /Earn \\+|Steady demand/.test(body),
        hasCampaign: /Peak|Quest|Bonus|Kickoff|Centrul|Sandton|Heathrow|Otopeni|OR Tambo|Central London/.test(body),
        currencyHint: (/£|lei|\\bR\\d/.test(body) || /lei/.test(body)),
        bodySample: body.slice(0, 280),
        mapPresent: !!leaflet,
      }
    })()`,
  )

  // Open profile for rates
  await evaluate(`document.querySelector('.fab-profile')?.click()`)
  await sleep(1200)
  const rates = await evaluate(
    `(() => {
      const text = document.body.innerText
      const accepted = (text.match(/Accepted[\\s\\S]{0,40}?(\\d+%)/) || [])[1] || null
      const cancelled = (text.match(/Cancelled[\\s\\S]{0,40}?(\\d+%)/) || [])[1] || null
      return { accepted, cancelled, hasMetrics: /Accepted/.test(text) && /Cancelled/.test(text) }
    })()`,
  )

  results.push({
    market,
    ...report,
    ...rates,
    exceptions: errors.slice(0, 2),
  })
}

for (const r of results) {
  const ok =
    r.mapPresent &&
    r.hasCampaign &&
    r.currencyHint &&
    r.hasMetrics &&
    r.exceptions.length === 0
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.market}`, JSON.stringify(r, null, 0))
}

cleanup()
process.exit(results.every((r) => r.mapPresent && r.hasCampaign && r.hasMetrics) ? 0 : 1)
