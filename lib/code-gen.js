const handlebars = require('handlebars')
const extractDefinitions = require('./extract-definitions.js')

function codeGen (doc) {
  const definitions = extractDefinitions(doc)
  const templateSource = `
{{#enums}}
export type {{typeName}} =
{{#enums}}
  {{#if @index}}| {{/if}}'{{{this}}}'
{{/enums}}

export const {{valueName}}: {{typeName}}[] = [
{{#enums}}
  '{{{this}}}'{{#unless @last}},{{/unless}}
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
