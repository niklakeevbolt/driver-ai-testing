import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFile } from 'node:fs/promises'
import http from 'node:http'

const BASE = process.argv[2] ?? 'http://localhost:4175/'
const PORT = 9228
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const CASES = [
  { name: 'mobile', width: 393, height: 852, mobile: true, touch: true },
  { name: 'desktop', width: 1440, height: 900, mobile: false, touch: false },
]

async function connect(profile) {
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
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
  await send('Runtime.enable')
  return { chrome, send, errors }
}

const evaluate = async (send, expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true })
  return res.result?.result?.value ?? res.result?.value
}

for (const testCase of CASES) {
  const profile = `/tmp/dai-layout-${testCase.name}`
  const { chrome, send, errors } = await connect(profile)

  await send('Emulation.setDeviceMetricsOverride', {
    width: testCase.width,
    height: testCase.height,
    deviceScaleFactor: 1,
    mobile: testCase.mobile,
  })
  await send('Emulation.setTouchEmulationEnabled', { enabled: testCase.touch })
  if (testCase.touch) {
    await send('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' })
  }

  await send('Page.navigate', { url: `${BASE}?v=${Date.now()}` })
  await sleep(3000)

  await evaluate(
    send,
    `const i=document.querySelector('input[type=password]');
     Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(i,'driver-ai');
     i.dispatchEvent(new Event('input',{bubbles:true}));
     document.querySelector('button[type=submit]').click();`,
  )
  await sleep(12000)

  const result = await evaluate(
    send,
    `(() => {
      const full = document.querySelector('.app-fullscreen')
      return {
        pointerFine: matchMedia('(pointer: fine)').matches,
        fullscreenLayout: !!full,
        phoneBezel: !!document.querySelector('.phone-shell'),
        devSidebar: !!Array.from(document.querySelectorAll('*')).find(
          (el) => el.textContent === 'SELECT SCREEN',
        ),
        fillsViewport: full
          ? full.clientWidth === innerWidth && Math.abs(full.clientHeight - innerHeight) <= 1
          : null,
        pageScrolls: document.documentElement.scrollHeight > innerHeight + 1,
        crashed: document.body.innerText.includes('Something went wrong'),
      }
    })()`,
  )

  console.log(`\n[${testCase.name}] ${testCase.width}x${testCase.height}`)
  console.log(JSON.stringify(result, null, 2))
  console.log('exceptions:', errors.length, errors.slice(0, 2))

  const shot = await send('Page.captureScreenshot', {})
  await writeFile(
    `/tmp/layout-${testCase.name}.png`,
    Buffer.from(shot.result?.result?.data ?? shot.result?.data, 'base64'),
  )
  chrome.kill()
  await sleep(600)
}
