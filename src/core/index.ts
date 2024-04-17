export const valueInObj = <T extends Record<string | number | symbol, unknown>>(
  value: string | number | symbol,
  obj: T
): value is keyof T => {
  return value in obj
}
