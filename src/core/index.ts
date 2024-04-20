import fs from 'node:fs'
import stream from 'node:stream'
import util from 'node:util'
import cp from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import zlib from 'node:zlib'
import { FuncResponse } from './types.js'

const pipe = promisify(pipeline)

export const valueInObj = <T extends Record<string | number | symbol, unknown>>(
  value: string | number | symbol,
  obj: T
): value is keyof T => {
  return value in obj
}

export const download = async (args: {
  url: string
  dest: string
}): Promise<FuncResponse> => {
  const { url, dest } = args

  try {
    const res = await fetch(url)

    if (!res.body) {
      return {
        error: 'No body in response',
        success: false,
      }
    }

    const readable = stream.Readable.fromWeb(res.body)
    const writeStream = fs.createWriteStream(dest)
    await stream.promises.finished(readable.pipe(writeStream))

    return {
      success: true,
    }
  } catch (e) {
    return {
      error: getErrorMessage(e),
      success: false,
    }
  }
}

export const getErrorMessage = (maybeError: unknown): string => {
  if (
    typeof maybeError === 'object' &&
    maybeError !== null &&
    'message' in maybeError &&
    typeof maybeError.message === 'string'
  ) {
    return maybeError.message
  }

  return 'Unknown error'
}

export const isDir = async (path: string): Promise<boolean> => {
  try {
    const stats = await fs.promises.stat(path)
    return stats.isDirectory()
  } catch (error) {
    return false
  }
}

export const execAsync = async (
  cmd: string,
  options: {
    log?: boolean
  } = {}
) => {
  const { log = true } = options

  const promise = util.promisify(cp.exec)(cmd)
  const child = promise.child

  if (log) {
    child.stdout?.pipe(process.stdout)
    child.stderr?.pipe(process.stdout)
  }

  await promise
}

export const chunk = <T = unknown>(arr: T[], n: number): T[][] => {
  return arr.reduce(
    (chunk: T[][], val) => {
      if (chunk[chunk.length - 1].length === n) chunk.push([])
      chunk[chunk.length - 1].push(val)
      return chunk
    },
    [[]]
  )
}

export const gzip = async (
  input: string,
  output: string
): Promise<FuncResponse> => {
  try {
    const gzip = zlib.createGzip({
      level: zlib.constants.Z_BEST_COMPRESSION,
    })
    const source = createReadStream(input)
    const destination = createWriteStream(output)
    await pipe(source, gzip, destination)

    return { success: true }
  } catch (e) {
    return {
      error: getErrorMessage(e),
      success: false,
    }
  }
}

export const gunzip = async (
  input: string,
  output: string
): Promise<FuncResponse> => {
  try {
    const gunzip = zlib.createGunzip()
    const source = createReadStream(input)
    const destination = createWriteStream(output)
    const stream = source.pipe(gunzip).pipe(destination)
    await new Promise((resolve) => stream.on('finish', resolve))

    return { success: true }
  } catch (e) {
    return {
      error: getErrorMessage(e),
      success: false,
    }
  }
}
