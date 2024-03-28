import { Token } from '@dneroswap/swap-sdk-core'
import { WDNERO, unwrappedToken } from '@dneroswap/tokens'
import { WNATIVE } from '@dneroswap/sdk'
import { priceHelperTokens } from '../constants/common'
import { FarmConfigV3, ComputedFarmConfigV3 } from './types'

function sortFarmLP(token0: Token, token1: Token) {
  const commonTokens = priceHelperTokens[token0.chainId as keyof typeof priceHelperTokens]
  if (commonTokens) {
    const commonTokensList = [
      WNATIVE[token0.chainId as keyof typeof WNATIVE],
      ...commonTokens.list,
      WDNERO[token0.chainId as keyof typeof WDNERO] ? WDNERO[token0.chainId as keyof typeof WDNERO] : undefined,
    ].filter(Boolean) as Token[]
    const someToken0 = commonTokensList.some((token) => token.equals(token0))
    const someToken1 = commonTokensList.some((token) => token.equals(token1))
    if (someToken0 && someToken1) {
      return commonTokensList.indexOf(token0) > commonTokensList.indexOf(token1) ? [token0, token1] : [token1, token0]
    }
    if (someToken0) {
      return [token1, token0]
    }
    if (someToken1) {
      return [token0, token1]
    }
  }

  return [token0, token1]
}

export function defineFarmV3Configs(farmConfig: FarmConfigV3[]): ComputedFarmConfigV3[] {
  return farmConfig.map((config) => {
    const [token, quoteToken] = sortFarmLP(config.token0, config.token1)
    return {
      ...config,
      token,
      quoteToken,
      lpSymbol: `${unwrappedToken(token).symbol}-${unwrappedToken(quoteToken).symbol} LP`,
    }
  })
}