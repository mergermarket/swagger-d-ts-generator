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
export interface SampleDefinition {
  prop1: string
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
export interface SampleDefinition {
  prop1: string
  prop2: string
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
export interface SampleDefinition {
  prop1?: string
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
export interface SampleDefinition {
  integerProp?: number
  numberProp?: number
  boolProp?: boolean
  dateProp?: string
  dateTimeProp?: string
  stringProp?: string
  objectProp?: Object
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
export interface SampleDefinition {
  complexProp?: ComplexTypeDef
}
export interface ComplexTypeDef {
  prop1?: string
  prop2?: boolean
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
export interface SampleDefinition {
  complexArray?: ComplexTypeDef[]
}
export interface ComplexTypeDef {
  prop1?: string
  prop2?: boolean
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
export interface SampleDefinition {
  simpleArray?: string[]
}
`

  assertTransformation(t, input, expected)
})

test('enum as a reference', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          prop1: {
            $ref: '#/definitions/List'
          }
        }
      },
      List: {
        type: 'string',
        enum: ['loan', 'bond']
      }
    }
  }

  const expected = `
export type listType =
  'loan'
  | 'bond'

export const listValues: listType[] = [
  'loan',
  'bond'
]

export interface SampleDefinition {
  prop1?: listType
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
            enum: ['loan', 'bond']
          }
        }
      }
    }
  }

  const expected = `
export type prop1Type =
  'loan'
  | 'bond'

export const prop1Values: prop1Type[] = [
  'loan',
  'bond'
]

export interface SampleDefinition {
  prop1?: prop1Type
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
              enum: ['loan', 'bond']
            }
          }
        }
      }
    }
  }

  const expected = `
export type prop1Type =
  'loan'
  | 'bond'

export const prop1Values: prop1Type[] = [
  'loan',
  'bond'
]

export interface SampleDefinition {
  prop1?: prop1Type[]
}
`
  assertTransformation(t, input, expected)
})

test('convert kebab to camel case', t => {
  const input = {
    definitions: {
      SampleDefinition: {
        properties: {
          'prop-type-string': {
            type: 'string',
            enum: ['loan', 'bond']
          }
        }
      }
    }
  }

  const expected = `
export type propTypeStringType =
  'loan'
  | 'bond'

export const propTypeStringValues: propTypeStringType[] = [
  'loan',
  'bond'
]

export interface SampleDefinition {
  propTypeString?: propTypeStringType
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
