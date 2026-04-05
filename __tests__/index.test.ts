import { safeString, traverseArray, traverseObject } from '../src/index'
import fs from 'fs'
import YAML from 'yaml'

describe('index', () => {
  it('creates safe strings for github workflow output variables', () => {
    const unsafeString: string =
      "This-string.is:a valid YAML string, but we're going to make it #afe for (GitHub) [Workflow] Out+ut/Variables"
    const result: string = safeString(unsafeString)
    expect(result).toEqual(
      'this_string_is_a_valid_yaml_string_but_were_going_to_make_it_safe_for_github_workflow_output_variables',
    )
  })
  it('traverses an object', () => {
    const yamlFile = fs.readFileSync('__tests__/traverseobject.yaml', 'utf8')
    const yamlParse = YAML.parse(yamlFile)
    console.log(`***** Output Variables *****`)
    const result = traverseObject(yamlParse)
    expect(result).toBeTruthy()
  })
  it('traverses an array', () => {
    const yamlFile = fs.readFileSync('__tests__/traversearray.yaml', 'utf8')
    const yamlParse = YAML.parse(yamlFile)
    console.log(`***** Output Variables *****`)
    const result = traverseArray(yamlParse['News'])
    expect(result).toBeTruthy()
  })
  it('traverses an object with nested arrays', () => {
    const data = {
      projects: {
        ruby: ['psych', 'RbYaml', 'yaml4r'],
        python: ['PyYaml', 'PySyck'],
      },
      numbers: [3, 15, 23.45],
    }
    const result = traverseObject(data)
    expect(result).toBeTruthy()
  })
  it('traverses an array containing objects', () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    const result = traverseArray(data)
    expect(result).toBeTruthy()
  })
  it('traverses an array containing nested arrays', () => {
    const data = [['a', 'b'], ['c', 'd']]
    const result = traverseArray(data)
    expect(result).toBeTruthy()
  })
  it('traverses with a document index', () => {
    const data = { name: 'test', items: ['one', 'two'] }
    const result = traverseObject(data, 0)
    expect(result).toBeTruthy()
  })
  it('traverses an array with a document index', () => {
    const data = ['first', 'second']
    const result = traverseArray(data, 0)
    expect(result).toBeTruthy()
  })
  it('handles boolean and number values', () => {
    const data = { enabled: true, count: 42, label: 'test' }
    const result = traverseObject(data)
    expect(result).toBeTruthy()
  })
  it('returns false when traverseObject receives null', () => {
    const result = traverseObject(null as any)
    expect(result).toBeFalsy()
  })
  it('parses a single document yaml file', () => {
    process.env['INPUT_YAML-FILE'] = '__tests__/traverseobject.yaml'
    process.env['INPUT_MULTIDOC'] = 'false'
    process.env['NODE_ENV'] = 'test'
    jest.isolateModules(() => {
      require('../src/index')
    })
  })
  it('parses a multidoc yaml file', () => {
    process.env['INPUT_YAML-FILE'] = '__tests__/test-multidoc.yaml'
    process.env['INPUT_MULTIDOC'] = 'true'
    process.env['NODE_ENV'] = 'test'
    jest.isolateModules(() => {
      require('../src/index')
    })
  })
  it('parses front matter from a markdown file', () => {
    process.env['INPUT_YAML-FILE'] = '__tests__/front-matter.md'
    process.env['INPUT_MULTIDOC'] = 'true'
    process.env['NODE_ENV'] = 'test'
    jest.isolateModules(() => {
      require('../src/index')
    })
  })
  it('handles errors when yaml file does not exist', () => {
    process.env['INPUT_YAML-FILE'] = '__tests__/nonexistent.yaml'
    process.env['INPUT_MULTIDOC'] = 'false'
    process.env['NODE_ENV'] = 'test'
    jest.isolateModules(() => {
      require('../src/index')
    })
  })
})
