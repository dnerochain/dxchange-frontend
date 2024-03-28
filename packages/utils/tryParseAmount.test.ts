import { Token } from '@dneroswap/swap-sdk-core'
import { describe, it, expect } from 'vitest'
import tryParseAmount from './tryParseAmount'

describe('utils/tryParseAmount', () => {
  it('should be undefined when no valid input', () => {
    expect(tryParseAmount()).toBeUndefined()
  })
  it('should be undefined when input is 0', () => {
    expect(tryParseAmount('0.00')).toBeUndefined()
  })

  it('should pared value', () => {
    expect(
      tryParseAmount(
        '100',
        new Token(
          //56,
		  5647,
          '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
          18,
          'WDNERO',
          'DneroSwap Token',
          'https://pancakeswap.finance/',
        ),
      ),
    ).toBeTruthy()
  })
})
