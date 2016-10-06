const test = require('ava')
const codeGen = require('../lib/code-gen.js')

test('simple transform', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        required: ['prop1'],
        properties: {
          prop1: {
            type: 'string'
          }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    interface SampleDefinition {
      prop1: string
    }
  }
  `
  assertTransformation(t, input, expected)
})


test('transform definition with multiple properties', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        required: ['prop1', 'prop2'],
        properties: {
          prop1: {
            type: 'string'
          },
          prop2: {
            type: 'string'
          }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    interface SampleDefinition {
      prop1: string
      prop2: string
    }
  }
  `
  assertTransformation(t, input, expected)
})


test('non-required property', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          prop1: {
            type: 'string'
          }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    interface SampleDefinition {
      prop1?: string
    }
  }
  `
  assertTransformation(t, input, expected)
})

test('simple datatype mapping', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          integerProp: { type: 'integer' },
          numberProp: { type: 'number' },
          boolProp: { type: 'boolean' },
          dateProp: { type: 'string', format: 'date' },
          dateTimeProp: { type: 'string', format: 'date-time' },
          stringProp: { type: 'string' },
          objectProp: { type: 'object' }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    interface SampleDefinition {
      integerProp?: number
      numberProp?: number
      boolProp?: boolean
      dateProp?: Date
      dateTimeProp?: Date
      stringProp?: string
      objectProp?: Object
    }
  }
  `

  assertTransformation(t, input, expected)
})

test('complex type mapping', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          complexProp: {
            $ref: '#/definitions/ComplexTypeDef'
          }
        }
      },
      ComplexTypeDef: {
        properties: {
          prop1: { type: 'string' },
          prop2: { type: 'boolean' }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    interface SampleDefinition {
      complexProp?: ComplexTypeDef
    }
    interface ComplexTypeDef {
      prop1?: string
      prop2?: boolean
    }
  }
  `

  assertTransformation(t, input, expected)
})

test('complex array types', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          complexArray: {
            type: 'array',
            items: {$ref: '#/definitions/ComplexTypeDef'}
          }
        }
      },
      ComplexTypeDef: {
        properties: {
          prop1: { type: 'string' },
          prop2: { type: 'boolean' }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    interface SampleDefinition {
      complexArray?: ComplexTypeDef[]
    }
    interface ComplexTypeDef {
      prop1?: string
      prop2?: boolean
    }
  }
  `

  assertTransformation(t, input, expected)
})

test('simple array types', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          simpleArray: {
            type: 'array',
            items: {type: 'string'}
          }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    interface SampleDefinition {
      simpleArray?: string[]
    }
  }
  `

  assertTransformation(t, input, expected)
})

test('enums', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          prop1: {
            type: 'string',
            enums: ['loan', 'bond']
          }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    type prop1Type =
      | "loan"
      | "bond"
    
    interface SampleDefinition {
      prop1?: prop1Type
    }
  }
  `
  assertTransformation(t, input, expected)
})

test('enum within array', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          prop1: {
            type: 'array',
            items: {
              type: 'string',
              enums: ['loan', 'bond']
            }
          }
        }
      }
    }
  }

  const expected = `
  declare module "swagger-defs" {
    type prop1Type =
      | "loan"
      | "bond"
    
    interface SampleDefinition {
      prop1?: prop1Type[]
    }
  }
  `
  assertTransformation(t, input, expected)
})

function assertTransformation (t, input, expected) {
  const output = codeGen(input)
  t.deepEqual(output, expected, printDiff(output, expected))
}

function printDiff (actual, expected) {
  return `
  Differences found:

  expected
  ===============
  ${expected}

  actual
  ===============
  ${actual}
  `
}
