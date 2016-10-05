const handlebars = require('handlebars')
const extractDefinitions = require('./extract-definitions.js')

function codeGen (doc) {
  const definitions = extractDefinitions(doc)

  const templateSource = `
  declare module "swagger-defs" {
    {{#classes}}
    interface {{classname}} {
      {{#properties}}
      {{propname}}{{#unless required}}?{{/unless}}: {{type}}
      {{/properties}}
    }
    {{/classes}}
  }
  `
  const template = handlebars.compile(templateSource)

  return template(definitions)
}

module.exports = codeGen
