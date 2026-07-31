import { StrictMode, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import Clear from '../src/vendor/kalep-icons/Clear.js'
import Surge from '../src/vendor/kalep-icons/Surge.js'
import { IconButton, GhostButton } from '../src/ui/index.jsx'

const cases = [
  ['Clear', createElement(Clear, { size: 'lg' })],
  ['Surge', createElement(Surge, { size: 'xs', style: { color: '#fff' } })],
  ['IconButton', createElement(IconButton, {
    icon: createElement(Clear, { size: 'lg' }),
    variant: 'floating',
    size: 'md',
    shape: 'round',
    'aria-label': 'Close',
  })],
  ['GhostButton', createElement(GhostButton, { size: 'md' }, 'View all')],
]

for (const [name, el] of cases) {
  try {
    renderToString(createElement(StrictMode, null, el))
    console.log(`${name}: OK`)
  } catch (error) {
    console.error(`${name}: FAIL`, error.message)
  }
}
