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

function flatMap (lambda, obj) {
  return obj.concat.apply([], obj.map(lambda))
}

function extractDefinitions (doc) {
  const extract = {
    classes: mapClasses(doc.definitions),
    enums: mapEnums(doc.definitions)
  }

  return extract
}

function mapClasses (definitions) {
  const classes = Object.keys(definitions)
  return classes.map(classname => mapClass(classname, definitions)).filter(x => x !== undefined)
}

function mapEnums (definitions) {
  const defs = Object.keys(definitions)
  return flatMap(defName => mapEnumsForDef(defName, definitions[defName]), defs)
}

function mapEnumsForDef (defName, definition) {
  if (definition.enum) return createEnumDef(defName, definition.enum)
  const props = Object.keys(definition.properties)
  return props.map(propName => mapEnumsForProperty(propName, definition.properties[propName]))
    .filter(x => x !== undefined)
}

function mapEnumsForProperty (propName, property) {
  if (property.enum) {
    return createEnumDef(propName, property.enum)
  } else if (property.type === 'array') {
    return mapEnumsForProperty(propName, property.items)
  }
}

const createEnumDef = (enumName, enums) => ({
  name: kebabToCamel(enumName),
  enums: enums
})

function mapClass (classname, definitions) {
  const definition = definitions[classname]
  if (definition.properties) {
    return {
      classname,
      properties: mapProperties(definition, definitions)
    }
  }
}

function mapProperties (definition, definitions) {
  if (!definition.properties) return
  const props = Object.keys(definition.properties)
  return props.map(prop => mapProperty(prop, definition, definitions))
}

function mapProperty (prop, definition, definitions) {
  return {
    propname: kebabToCamel(prop),
    type: mapType(prop, definition.properties[prop], definitions),
    required: definition.required && definition.required.includes(prop)
  }
}

function mapType (propName, prop, definitions) {
  if (prop.$ref) {
    return mapReference(prop.$ref, definitions)
  } else if (prop.enum) {
    return mapToEnumType(propName)
  }
  return mapSimpleType(propName, prop, definitions)
}

function mapToEnumType (propName) {
  return kebabToCamel(propName) + 'Type'
}

function mapReference (ref, definitions) {
  if (ref) {
    // currently only supports single level definitions
    const refName = getRefName(ref)
    const definition = definitions[refName]

    if (definition.enum) {
      return mapToEnumType(refName)
    } else {
      return refName
    }
  }
}

function getRefName (ref) {
  const path = ref.substring(0, ref.lastIndexOf('/') + 1)
  const name = ref.substring(ref.lastIndexOf('/') + 1, ref.length)
  if (!path === '#/definitions/') {
    throw new Error('Invalid property type')
  }
  return name
}

function mapSimpleType (propName, prop, definitions) {
  if (prop.type === 'integer' || prop.type === 'number') {
    return 'number'
  } else if (prop.type === 'boolean') {
    return 'boolean'
  } else if (prop.type === 'string' && prop.format && (prop.format === 'date' || prop.format === 'date-time')) {
    return 'Date'
  } else if (prop.type === 'string') {
    return 'string'
  } else if (prop.type === 'array') {
    return mapType(propName, prop.items, definitions) + '[]'
  } else if (prop.type === 'object') {
    return 'Object'
  }
  throw new Error('Invalid property type')
}

function kebabToCamel (s) {
  const str = s.replace(/(\-\w)/g, function (m) { return m[1].toUpperCase() })
  return str.charAt(0).toLowerCase() + str.slice(1)
}

module.exports = extractDefinitions
