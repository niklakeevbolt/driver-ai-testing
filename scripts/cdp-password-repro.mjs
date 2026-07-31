#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import http from 'node:http'

const URL = process.argv[2] || 'https://niklakeevbolt.github.io/driver-ai-testing/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

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
  '--remote-debugging-port=9223',
  '--user-data-dir=/tmp/driver-ai-chrome-repro2',
  'about:blank',
], { stdio: 'ignore' })

await sleep(1500)

const targets = await fetchJson('http://127.0.0.1:9223/json/list')
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)

let id = 0
const pending = new Map()
const errors = []

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(String(event.data))
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exception.description)
    console.log('EXCEPTION:', msg.params.exception.description)
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
await send('Page.enable')
await send('Page.navigate', { url: URL })
await sleep(3000)

// Simulate manual password entry
await send('Runtime.evaluate', {
  expression: `
    const input = document.querySelector('input[type=password]');
    const btn = document.querySelector('button[type=submit]');
    input.value = 'driver-ai';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    btn.disabled = false;
    btn.click();
    'submitted';
  `,
  returnByValue: true,
})
await sleep(12000)

const dom = await send('Runtime.evaluate', {
  expression: `({
    text: document.body.innerText.slice(0, 500),
    hasError: document.body.innerText.includes('Something went wrong'),
    hasMap: document.body.innerText.includes('Go online'),
  })`,
  returnByValue: true,
})
console.log('RESULT:', JSON.stringify(dom.result?.value, null, 2))
console.log('ERROR COUNT:', errors.length)

chrome.kill()
process.exit(errors.length ? 1 : 0)
