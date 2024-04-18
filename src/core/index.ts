import fs from 'fs'
import stream from 'stream'
import util from 'util'
import cp from 'child_process'
import { FuncResponse } from './types.js'

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
