import { describe, it, expect } from 'vitest'
import { chunk } from '../index.js'

describe('core', () => {
  describe('chunk', () => {
    it('should succeed', () => {
      const result = chunk([1, 2, 3, 4, 5], 2)
      expect(result).toEqual([[1, 2], [3, 4], [5]])
    })

    it('should succeed', () => {
      const result = chunk([1, 2, 3, 4, 5], 3)
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5],
      ])
    })

    it('should succeed', () => {
      const result = chunk([1, 2, 3, 4, 5], 1)
      expect(result).toEqual([[1], [2], [3], [4], [5]])
    })
  })
})
