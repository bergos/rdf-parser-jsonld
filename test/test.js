'use strict'

/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-data-model')
const stringToStream = require('string-to-stream')
const JSONLDParser = require('..')

function streamToPromise (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

describe('rdf-parser-jsond', () => {
  it('should support Named Node subjects', () => {
    let example = {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object'
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].subject.termType, 'NamedNode')
      assert.equal(output[0].subject.value, 'http://example.org/subject')
    })
  })

  it('should support Blank Node subjects', () => {
    let example = {
      'http://example.org/predicate': 'object'
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].subject.termType, 'BlankNode')
    })
  })

  it('should parse the predicate', () => {
    let example = {
      'http://example.org/predicate': 'object'
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].predicate.termType, 'NamedNode')
      assert.equal(output[0].predicate.value, 'http://example.org/predicate')
    })
  })

  it('should parse a Named Node object', () => {
    let example = {
      'http://example.org/predicate': {
        '@id': 'http://example.org/object'
      }
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].object.termType, 'NamedNode')
      assert.equal(output[0].object.value, 'http://example.org/object')
    })
  })

  it('should parse a Blank Node object', () => {
    let example = {
      'http://example.org/predicate': {}
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].object.termType, 'BlankNode')
    })
  })

  it('should keep Blank Node object mapping', () => {
    let example = {
      'http://example.org/predicate1': {'@id': '_:b0'},
      'http://example.org/predicate2': {'@id': '_:b0'}
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 2)
      assert.equal(output[0].object.equals(output[1].object), true)
    })
  })

  it('should parse a Literal object', () => {
    let example = {
      'http://example.org/predicate': {
        '@value': 'object'
      }
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].object.termType, 'Literal')
      assert.equal(output[0].object.value, 'object')
      assert.equal(output[0].object.language, '')
      assert.equal(output[0].object.datatype.value, 'http://www.w3.org/2001/XMLSchema#string')
    })
  })

  it('should parse the language of a Literal object', () => {
    let example = {
      'http://example.org/predicate': {
        '@value': 'object',
        '@language': 'en'
      }
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].object.termType, 'Literal')
      assert.equal(output[0].object.value, 'object')
      assert.equal(output[0].object.language, 'en')
      assert.equal(output[0].object.datatype.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
    })
  })

  it('should parse the datatype of a Literal object', () => {
    let example = {
      'http://example.org/predicate': {
        '@value': 'object',
        '@type': 'http://example.org/datatype'
      }
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].object.termType, 'Literal')
      assert.equal(output[0].object.value, 'object')
      assert.equal(output[0].object.language, '')
      assert.equal(output[0].object.datatype.value, 'http://example.org/datatype')
    })
  })

  it('should use the default graph if none was given', () => {
    let example = {
      'http://example.org/predicate': 'object'
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].graph.termType, 'DefaultGraph')
    })
  })

  it('should parse graph', () => {
    let example = {
      '@id': 'http://example.org/graph',
      '@graph': {
        'http://example.org/predicate': 'object'
      }
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].graph.termType, 'NamedNode')
      assert.equal(output[0].graph.value, 'http://example.org/graph')
    })
  })

  it('should support .match', () => {
    let example = {
      'http://example.org/predicate': ['object1', 'object2']
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))
    let output = []

    parser.match(null, null, rdf.literal('object1')).on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].object.termType, 'Literal')
      assert.equal(output[0].object.value, 'object1')
    })
  })

  it('should use baseIRI option', () => {
    let example = {
      '@id': 'subject',
      'http://example.org/predicate': 'object'
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)), {baseIRI: 'http://example.org/'})
    let output = []

    parser.on('data', (triple) => {
      output.push(triple)
    })

    return streamToPromise(parser).then(() => {
      assert.equal(output.length, 1)
      assert.equal(output[0].subject.termType, 'NamedNode')
      assert.equal(output[0].subject.value, 'http://example.org/subject')
    })
  })

  it('should throw an error if JSON is invalid', () => {
    let parser = new JSONLDParser(stringToStream('{'))

    parser.resume()

    return new Promise((resolve, reject) => {
      streamToPromise(parser).then(reject).catch(resolve)
    })
  })

  it('should throw an error if JSON-LD is invalid', () => {
    let example = {
      '@context': 'object'
    }

    let parser = new JSONLDParser(stringToStream(JSON.stringify(example)))

    parser.resume()

    return new Promise((resolve, reject) => {
      streamToPromise(parser).then(reject).catch(resolve)
    })
  })
})
