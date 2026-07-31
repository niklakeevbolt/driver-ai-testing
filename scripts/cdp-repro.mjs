#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import http from 'node:http'

const URL = process.argv[2] || 'http://localhost:5174/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const AUTH_HASH = 'cac3ee3ff6501eadea0106782808fd53ffccf26ee872433c99886a9727379487'

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve(JSON.parse(data)))
    }).on('error', reject)
  })
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--remote-debugging-port=9222',
  '--user-data-dir=/tmp/driver-ai-chrome-repro',
  'about:blank',
], { stdio: 'ignore' })

await sleep(1500)

const targets = await fetchJson('http://127.0.0.1:9222/json/list')
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)

let id = 0
const pending = new Map()

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(String(event.data))
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
  if (msg.method === 'Runtime.consoleAPICalled') {
    const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ')
    console.log('CONSOLE:', text)
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    console.log('EXCEPTION:', msg.params.exception.description)
    console.log('STACK:', msg.params.exception.stackTrace?.callFrames?.slice(0, 5))
  }
})

function send(method, params = {}) {
  return new Promise((resolve) => {
    const msgId = ++id
    pending.set(msgId, resolve)
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })
}

await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})

await send('Runtime.enable')
await send('Log.enable')
await send('Page.enable')
await send('Page.navigate', { url: URL })
await sleep(2000)
await send('Runtime.evaluate', {
  expression: `sessionStorage.setItem('driver-ai-testing-auth', '${AUTH_HASH}'); location.reload();`,
})
await sleep(10000)

const dom = await send('Runtime.evaluate', {
  expression: 'document.body ? document.body.innerText.slice(0, 3000) : "NO BODY"',
  returnByValue: true,
})
console.log('DOM RESULT:', JSON.stringify(dom.result, null, 2))

chrome.kill()
process.exit(0)
