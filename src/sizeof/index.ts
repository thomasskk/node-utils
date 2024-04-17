import { SIZES } from './constants.js'

const preciseStringSizeNode = (str: string) => {
  if (str === '') return 4
  return Buffer.from(str).byteLength
}

const objectSizeComplex = (obj: unknown) => {
  let totalSize = 0
  const errorIndication = -1
  try {
    let potentialConversion = obj

    switch (true) {
      case obj instanceof Map:
        potentialConversion = Object.fromEntries(obj)
        break
      case obj instanceof Set:
        potentialConversion = Array.from(obj)
        break
      case obj instanceof Int8Array:
        return obj.length * SIZES.Int8Array
      case obj instanceof Uint8Array || obj instanceof Uint8ClampedArray:
        return obj.length * SIZES.Uint8Array
      case obj instanceof Int16Array:
        return obj.length * SIZES.Int16Array
      case obj instanceof Uint16Array:
        return obj.length * SIZES.Uint16Array
      case obj instanceof Int32Array:
        return obj.length * SIZES.Int32Array
      case obj instanceof Uint32Array:
        return obj.length * SIZES.Uint32Array
      case obj instanceof Float32Array:
        return obj.length * SIZES.Float32Array
      case obj instanceof Float64Array:
        return obj.length * SIZES.Float64Array
    }

    const objectToString = JSON.stringify(potentialConversion)
    const buffer = Buffer.from(objectToString)
    totalSize = buffer.byteLength
  } catch (ex) {
    console.error('Error detected, return ' + errorIndication, ex)
    return errorIndication
  }
  return totalSize
}

const objectSizeSimple = (obj: unknown) => {
  const objectList: unknown[] = []
  const stack: unknown[] = [obj]
  let bytes = 0

  while (stack.length) {
    const value = stack.pop()

    switch (typeof value) {
      case 'boolean':
        bytes += SIZES.BYTES
        break
      case 'string':
        bytes += preciseStringSizeNode(value)
        break
      case 'number':
        bytes += SIZES.NUMBER
        break
      case 'symbol':
        bytes += (value.toString().length - 8) * SIZES.STRING
        break
      case 'bigint':
        bytes += Buffer.from(String(value)).byteLength
        break
      case 'function':
        bytes += value.toString().length
        break
      case 'object':
        if (objectList.indexOf(value) === -1) {
          objectList.push(value)
          for (const i in value) {
            // @ts-expect-error obj
            stack.push(value[i])
          }
        }
        break
    }
  }
  return bytes
}

export const sizeof = (obj: unknown) => {
  let totalSize = 0

  if (obj !== null && typeof obj === 'object') {
    totalSize = objectSizeComplex(obj)
  } else {
    totalSize = objectSizeSimple(obj)
  }

  return totalSize
}
