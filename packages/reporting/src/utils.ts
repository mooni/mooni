import * as fs from "fs"

export function readJSON(path: string): object {
  const raw = fs.readFileSync(path, 'utf8')
  return JSON.parse(raw)
}
export function write(path: string, data) {
  fs.writeFileSync(path, data, 'utf8')
}
export function writeJSON(path: string, data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(path, json, 'utf8')
}

function csvEscape(str) {
  const ss = str || '';
  return `"${ss}"`
}

export function writeCSV(path: string, data: Array<Array<string|number>>, headers?: Array<string>) {
  let csv = ''
  if(headers) {
    csv += headers.map(csvEscape).join(',')
    csv += '\n'
  }
  csv += data.map(row => row.map(csvEscape).join(',')).join('\n')
  write(path, csv)
}