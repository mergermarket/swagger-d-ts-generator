/*
Converts swagger definitions to the following format:

{
  classes: [{
    classname: 'HelloWorldResponse',
    properties: [{
      propname: 'message',
      type: 'string',
      required: true
    }, {
      propname: 'prop2',
      type: 'boolean',
      required: false
    }]
  }]
}
*/

function extractDefinitions (doc) {
  return {
    classes: mapClasses(doc.definitions)
  }
}

function mapClasses (definitions) {
  const classes = Object.keys(definitions)
  return classes.map(classname => mapClass(classname, definitions))
}

function mapClass (classname, definitions) {
  return {
    classname,
    properties: mapProperties(definitions[classname])
  }
}

function mapProperties (definition) {
  const props = Object.keys(definition.properties)
  return props.map(prop => mapProperty(prop, definition))
}

function mapProperty (prop, definition) {
  return {
    propname: prop,
    type: mapType(definition.properties[prop]),
    required: definition.required && definition.required.includes(prop)
  }
}

function mapType (prop) {
  const ref = prop.$ref

  if (ref) {
    const start = ref.substring(0, ref.lastIndexOf('/') + 1)
    const last = ref.substring(ref.lastIndexOf('/') + 1, ref.length)
    if (!start === '#/definitions/') {
      throw new Error('Invalid property type')
    }
    return last
  }
  return mapSimpleType(prop)
}

function mapSimpleType (prop) {
  if (prop.type === 'integer' || prop.type === 'number') {
    return 'number'
  } else if (prop.type === 'boolean') {
    return 'boolean'
  } else if (prop.type === 'string' && prop.format && (prop.format === 'date' || prop.format === 'date-time')) {
    return 'Date'
  } else if (prop.type === 'string') {
    return 'string'
  }
  throw new Error('Invalid property type')
}

module.exports = extractDefinitions

/*
integer || number -> number
boolean -> boolean
string (date || date-time) -> Date
_ -> string
*/
