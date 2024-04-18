import fs from 'fs'
import stream from 'stream'
import { FuncResponse } from './types.js'

export const valueInObj = <T extends Record<string | number | symbol, unknown>>(
  value: string | number | symbol,
  obj: T
): value is keyof T => {
  return value in obj
}

export const downloadFile = async (args: {
  url: string
  path: string
}): Promise<FuncResponse> => {
  const { url, path } = args

  try {
    const res = await fetch(url)

    if (!res.body) {
      return {
        error: 'No body in response',
        success: false,
      }
    }

    const readable = stream.Readable.fromWeb(res.body)
    const writeStream = fs.createWriteStream(path)
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
