const handlebars = require('handlebars')
const extractDefinitions = require('./extract-definitions.js')

function codeGen (doc) {
  const definitions = extractDefinitions(doc)
console.log(definitions)
  const templateSource = `
{{#enums}}
export type {{name}}Type =
{{#enums}}
  {{#if @index}}| {{/if}}'{{this}}'
{{/enums}}

export const {{name}}Values: {{name}}Type[] = [
{{#enums}}
  '{{this}}'{{#unless @last}},{{/unless}}
{{/enums}}
]
{{/enums}}{{#if enums.length}}
{{/if}}
{{#classes}}
export interface {{classname}} {
  {{#properties}}
  {{propname}}{{#unless required}}?{{/unless}}: {{type}}
  {{/properties}}
}
{{/classes}}
`
  const template = handlebars.compile(templateSource)

  return template(definitions)
}

module.exports = codeGen
