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

Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda))
}

function extractDefinitions (doc) {
  const extract = {
    classes: mapClasses(doc.definitions),
    enums: mapEnums(doc.definitions)
  }

  console.log(JSON.stringify(extract))

  return extract
}

function mapClasses (definitions) {
  const classes = Object.keys(definitions)
  return classes.map(classname => mapClass(classname, definitions))
}

function mapEnums (definitions) {
  const defs = Object.keys(definitions)
  return defs.flatMap(defName => mapEnumsForDef(definitions[defName]))
}

function mapEnumsForDef (definition) {
  const props = Object.keys(definition.properties)
  return props.map(propName => mapEnumsForProperty(propName, definition.properties[propName]))
    .filter(x => x !== undefined)
}

function mapEnumsForProperty (propName, property) {
  if (property.enums) {
    return {
      name: propName + 'Type',
      enums: property.enums
    }
  } else if (property.type === 'array') {
    return mapEnumsForProperty(propName, property.items)
  }
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
    type: mapType(prop, definition.properties[prop]),
    required: definition.required && definition.required.includes(prop)
  }
}

function mapType (propName, prop) {
  if (prop.$ref) {
    return mapReference(prop.$ref)
  } else if (prop.enums) {
    return propName + 'Type'
  }
  return mapSimpleType(propName, prop)
}

function mapReference (ref) {
  if (ref) {
    const start = ref.substring(0, ref.lastIndexOf('/') + 1)
    const last = ref.substring(ref.lastIndexOf('/') + 1, ref.length)
    if (!start === '#/definitions/') {
      throw new Error('Invalid property type')
    }
    return last
  }
}

function mapSimpleType (propName, prop) {
  if (prop.type === 'integer' || prop.type === 'number') {
    return 'number'
  } else if (prop.type === 'boolean') {
    return 'boolean'
  } else if (prop.type === 'string' && prop.format && (prop.format === 'date' || prop.format === 'date-time')) {
    return 'Date'
  } else if (prop.type === 'string') {
    return 'string'
  } else if (prop.type === 'array') {
    return mapType(propName, prop.items) + '[]'
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
