import { describe, it, expect } from 'vitest'
import { sizeof } from '../index.js'
import v8 from 'node:v8'

const LONG_STRING =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac vestibulum lacus, sit amet maximus libero. Aliquam erat volutpat. Quisque at orci tortor. Donec at mi nunc.'

describe('sizeof node.js tests', () => {
  it('should handle null in object keys', () => {
    const badData = { 1: { depot_id: null, hierarchy_node_id: null } }
    expect(sizeof(badData)).toEqual(48)
  })

  it('null is 0', () => {
    expect(sizeof(null)).toEqual(0)
  })

  it('number size shall be 8', () => {
    expect(sizeof(5)).toEqual(8)
  })

  it('undefined is 0', () => {
    // @ts-expect-error error
    expect(sizeof()).toEqual(0)
  })

  it('of 3 chars string is 3 bytes in node.js', () => {
    const abcString = 'abc'
    expect(sizeof(abcString)).toEqual(3)
  })

  it('sizeof of empty string', () => {
    const emptyString = ''
    expect(sizeof(emptyString)).toEqual(v8.serialize(emptyString).byteLength)
    expect(sizeof(emptyString)).toEqual(4)
  })

  it('sizeof of a long string', () => {
    expect(sizeof(LONG_STRING)).toEqual(171)
  })

  it('boolean size shall be 4', () => {
    expect(sizeof(true)).toEqual(4)
  })

  it('report an error for circular dependency objects', () => {
    const firstLevel = { a: 1 }
    const secondLevel = { b: 2, c: firstLevel }
    // @ts-expect-error error
    firstLevel.second = secondLevel
    expect(sizeof(firstLevel)).toBeTruthy()
  })

  it('handle hasOwnProperty key', () => {
    expect(sizeof({ hasOwnProperty: undefined })).toEqual(2)
    expect(sizeof({ hasOwnProperty: 'Hello World' })).toEqual(32)
    expect(sizeof({ hasOwnProperty: 1234 })).toEqual(23)
  })

  it('supports symbol', () => {
    const descriptor = 'abcd'
    expect(sizeof(Symbol(descriptor))).toEqual(2 * descriptor.length)
  })

  it('supports global symbols', () => {
    const globalSymbol = Symbol.for('a')
    const obj = { [globalSymbol]: 'b' }
    expect(sizeof(obj)).toEqual(2)
  })

  it('array support for strings - longer array should have sizeof above the shorter one', () => {
    expect(sizeof(['a', 'b', 'c', 'd'])).toBeGreaterThan(sizeof(['a', 'b']))
  })

  it('array support for numbers - longer array should have sizeof above the shorter one', () => {
    expect(sizeof([1, 2, 3])).toBeGreaterThan(sizeof([1, 2]))
  })

  it('array support for NaN - longer array should have sizeof above the shorter one', () => {
    expect(sizeof([NaN, NaN])).toBeGreaterThan(sizeof([NaN]))
  })

  it('map support', () => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    const mapSmaller = new Map()
    mapSmaller.set('a', 1)
    const mapBigger = new Map()
    mapBigger.set('a', 1)
    mapBigger.set('b', 2)
    expect(sizeof(mapBigger)).toBeGreaterThan(sizeof(mapSmaller))
  })

  it('set support', () => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    const smallerSet = new Set()
    smallerSet.add(1) // Set(1) { 1 }

    const biggerSet = new Set()
    biggerSet.add(1) // Set(1) { 1 }
    biggerSet.add('some text') // Set(3) { 1, 5, 'some text' }
    expect(sizeof(biggerSet)).toBeGreaterThan(sizeof(smallerSet))
  })

  it('typed array support', () => {
    const arrayInt8Array = new Int8Array([1, 2, 3, 4, 5])
    expect(sizeof(arrayInt8Array)).toEqual(5)

    const arrayUint8Array = new Uint8Array([1, 2, 3, 4, 5])
    expect(sizeof(arrayUint8Array)).toEqual(5)

    const arrayUint16Array = new Uint16Array([1, 2, 3, 4, 5])
    expect(sizeof(arrayUint16Array)).toEqual(10)

    const arrayInt16Array = new Int16Array([1, 2, 3, 4, 5])
    expect(sizeof(arrayInt16Array)).toEqual(10)

    const arrayUint32Array = new Uint32Array([1, 2, 3, 4, 5])
    expect(sizeof(arrayUint32Array)).toEqual(20)

    const arrayInt32Array = new Int32Array([1, 2, 3, 4, 5])
    expect(sizeof(arrayInt32Array)).toEqual(20)

    const arrayFloat32Array = new Float32Array([1, 2, 3, 4, 5])
    expect(sizeof(arrayFloat32Array)).toEqual(20)

    const arrayFloat64 = new Float64Array([1, 2, 3, 4, 5])
    expect(sizeof(arrayFloat64)).toEqual(40)
  })

  it('BigInt support', () => {
    expect(sizeof(BigInt(21474836480))).toEqual(11)
  })

  it('nested objects', () => {
    const obj = { a: 1, b: 2, c: 3 }
    expect(sizeof(obj)).toEqual(19)
    const nested = { d: obj }
    expect(sizeof(nested)).toEqual(25)
  })

  it('Function support', () => {
    const func = (one: number, two: number) => {
      return one + two
    }
    expect(sizeof(func)).toEqual(45)
  })
})
