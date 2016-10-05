const args = require('args')
const codeGen = require('./code-gen')
const fs = require('fs')
const docLoader = require('./doc-loader.js')

args
  .option('path', 'The path to the swagger file (supports yaml or json)', 'swagger.json')
  .option('out', 'The path to output the type definitions', 'typedefs.d.ts')

const flags = args.parse(process.argv)

console.log('Attempting to generate the type definitions...')

const doc = docLoader(flags.path)

const output = codeGen(doc)

fs.writeFileSync(flags.out, output, 'utf8')

console.log('Successfully generated type defintions.')
