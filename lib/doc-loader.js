const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')

function documentLoader (filePath) {
  const ext = path.extname(filePath)
  if (ext === '.yaml') {
    return yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
  } else if (ext === '.json') {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }
  throw new Error(`Unrecognised file extension for path: ${filePath}`)
}

module.exports = documentLoader
