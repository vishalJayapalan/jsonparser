const nullParse = input =>
  input.startsWith('null') ? [null, input.slice(4)] : null

function booleanParse (input) {
  if (input.startsWith('true')) return [true, input.slice(4)]
  if (input.startsWith('false')) return [false, input.slice(5)]
  return null
}
function numberParse (input) {
  const result = input.match(
    /(^-?[1-9]\d*([.]\d+)?(e[+-]?\d+)?)|(^-?0([.]\d+)(e[+-]?\d+)?)|(^-?0e[+-]?\d+)|(^-?0)/i
  )
  if (result === null) return null
  return [
    Number(input.slice(0, result[0].length)),
    input.slice(result[0].length)
  ]
}
function stringParse (input) {
  if (!input.startsWith('"')) return null
  let result = 0
  let fResult = ''
  const obj = {
    '"': '"',
    '\\': '\\',
    "'": "'",
    n: '\n',
    r: '\r',
    b: '\b',
    f: '\f',
    t: '\t',
    '/': '/'
  }
  for (let i = 1; i < input.length; i++) {
    if (input[i] === '\\') {
      if (input[i + 1] === 'u') {
        if (!/[\dA-F]{4}/gi.test(input.slice(i + 2, i + 6))) return null
        fResult += String.fromCodePoint(
          parseInt('0x' + input.slice(i + 2, i + 6))
        )
        i += 6
      } else if (obj.hasOwnProperty(input[i + 1])) {
        fResult += obj[input[i + 1]]
        i += 2
      } else return null
    } else {
      if (input[i] === '"') {
        result = i
        break
      } else if (input[i] === '\n' || input[i] === '\t') return null
      fResult += input[i]
      i++
    }
    i--
  }
  if (result === 0) return null
  return [fResult.slice(0, fResult.length), input.slice(result + 1)]
}
const fs = require('fs')
fs.readFile('input.txt', (err, data) => {
  if (err) throw err
  console.log(finalParse(data.toString()))
})
function arrayParse (input) {
  if (!input.startsWith('[')) return null
  const arr = []
  let final = input.slice(1).trim()
  if (final[0] === ']') return [arr, final.slice(1)]
  while (final) {
    const temp = valueParse(final)
    if (temp === null) return null
    arr.push(temp[0])
    final = temp[1].trim()
    if (final[0] === ',') final = final.slice(1)
    else if (final[0] === ']') return [arr, final.slice(1)]
    else return null
    if (!final) return null
  }
}
function objectParse (input) {
  if (!input.startsWith('{')) return null
  const obj = {}
  let final = input.slice(1).trim()
  if (final[0] === '}') return [obj, final.slice(1).trim()]
  while (final.trim()) {
    const temp = stringParse(final)
    if (temp === null) return null
    let second = temp[1].trim()
    if (second[0] !== ':') return null
    second = second.slice(1).trim()
    const temp1 = valueParse(second)
    if (temp1 === null) return null
    final = temp1[1].trim()
    obj[temp[0]] = temp1[0]
    if (final[0] === ',') {
      final = final.slice(1).trim()
    } else if (final[0] === '}') return [obj, final.slice(1)]
    else return null
    if (!final) return null
  }
}
function valueParse (input) {
  input = input.trim()
  const temp =
    nullParse(input) ||
    booleanParse(input) ||
    numberParse(input) ||
    stringParse(input) ||
    arrayParse(input) ||
    objectParse(input)
  if (temp === null) return null
  return temp
}
function finalParse (input) {
  const temp = arrayParse(input) || objectParse(input)
  if (temp === null || temp[1] !== '') return null
  return JSON.stringify(temp[0])
}
