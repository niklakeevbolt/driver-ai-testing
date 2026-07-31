import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(import.meta.dirname, '../src/vendor/kalep-icons')

const standardPattern =
  /function (Svg\w+)\(props\) \{\s*return \(React\.createElement\("svg", Object\.assign\(\{ width: sizes\[props\.size \|\| "lg"\], height: sizes\[props\.size \|\| "lg"\], viewBox: "([^"]+)", fill: "none", xmlns: "http:\/\/www\.w3\.org\/2000\/svg"(?:, "data-rtl-mirror": true)? \}, props\)/g

const replacement =
  'function $1({ size, ref, ...props }) {\n    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "$2", fill: "none", xmlns: "http://www.w3.org/2000/svg"$3, ...props }'

let patched = 0
for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.js') && name !== 'wrapIcon.js')) {
  const filePath = path.join(dir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  if (!content.includes('Object.assign')) continue

  content = content.replace(standardPattern, (_, name, viewBox, rtl) => {
    patched += 1
    const rtlAttr = rtl ? ', "data-rtl-mirror": true' : ''
    return `function ${name}({ size, ref, ...props }) {\n    return (React.createElement("svg", { width: sizes[size || "lg"], height: sizes[size || "lg"], viewBox: "${viewBox}", fill: "none", xmlns: "http://www.w3.org/2000/svg"${rtlAttr}, ...props }`
  })

  fs.writeFileSync(filePath, content)
}

console.log(`Patched ${patched} kalep icon files`)
