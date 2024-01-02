import { useIntersectionObserver } from '@dneroswap/hooks'
import { useTranslation } from '@dneroswap/localization'
import { ChainId } from '@dneroswap/chains'
import { dneroTokens } from '@dneroswap/tokens'
import { Balance, Flex, Heading, Skeleton, Text, useMatchBreakpoints } from '@dneroswap/uikit'
import { formatBigInt, formatLocalisedCompactNumber, formatNumber } from '@dneroswap/utils/formatBalance'
import { wdneroVaultV2ABI } from '@dneroswap/pools'
import { SLOW_INTERVAL } from 'config/constants'
import { useEffect, useState } from 'react'
import { useWDneroPrice } from 'hooks/useWDneroPrice'
import { styled } from 'styled-components'
import { getWDneroVaultAddress } from 'utils/addressHelpers'
import { publicClient } from 'utils/wagmi'
import { useWDneroEmissionPerBlock } from 'views/Home/hooks/useWDneroEmissionPerBlock'
import { erc20ABI } from 'wagmi'
import { useQuery } from '@tanstack/react-query'

const StyledColumn = styled(Flex)<{ noMobileBorder?: boolean; noDesktopBorder?: boolean }>`
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
    border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }
  &:nth-child(2n) {
    border-right: none;
  }
  width: 50%;
  ${({ theme }) => theme.mediaQueries.sm} {
    &:not(:last-child) {
      border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
      border-bottom: none;
    }
    &:nth-child(3) {
      border-right: none;
    }
    width: 33%;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    width: auto;
    &:not(:last-child) {
      border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
    }
  }
`
const StyledWrapper = styled(Flex)`
  margin-top: 24px;
  flex-direction: row;
  flex-wrap: wrap;
  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    flex-wrap: nowrap;
  }
`

/**
 * User (Planet Finance) built a contract on top of our original manual WDNERO pool,
 * but the contract was written in such a way that when we performed the migration from Masterchef v1 to v2, the tokens were stuck.
 * These stuck tokens are forever gone (see their medium post) and can be considered out of circulation."
 * https://planetfinanceio.medium.com/pancakeswap-works-with-planet-to-help-wdnero-holders-f0d253b435af
 * https://twitter.com/DneroSwap/status/1523913527626702849
 * https://explorer.dnerochain.xyz/tx/0xd5ffea4d9925d2f79249a4ce05efd4459ed179152ea5072a2df73cd4b9e88ba7
 */
const planetFinanceBurnedTokensWei = 637407922445268000000000n
const wdneroVaultAddress = getWDneroVaultAddress()

const WDneroDataRow = () => {
  const { t } = useTranslation()
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const [loadData, setLoadData] = useState(false)
  const emissionsPerBlock = useWDneroEmissionPerBlock(loadData)
  const { isMobile } = useMatchBreakpoints()

  const {
    data: { cakeSupply, burnedBalance, circulatingSupply } = {
      cakeSupply: 0,
      burnedBalance: 0,
      circulatingSupply: 0,
    },
  } = useQuery(
    ['cakeDataRow'],
    async () => {
      const [totalSupply, burned, totalLockedAmount] = await publicClient({ chainId: ChainId.DNERO }).multicall({
        contracts: [
          { abi: erc20ABI, address: dneroTokens.wdnero.address, functionName: 'totalSupply' },
          {
            abi: erc20ABI,
            address: dneroTokens.wdnero.address,
            functionName: 'balanceOf',
            args: ['0x000000000000000000000000000000000000dEaD'],
          },
          {
            abi: wdneroVaultV2ABI,
            address: wdneroVaultAddress,
            functionName: 'totalLockedAmount',
          },
        ],
        allowFailure: false,
      })
      const totalBurned = planetFinanceBurnedTokensWei + burned
      const circulating = totalSupply - (totalBurned + totalLockedAmount)

      return {
        cakeSupply: totalSupply && burned ? +formatBigInt(totalSupply - totalBurned) : 0,
        burnedBalance: burned ? +formatBigInt(totalBurned) : 0,
        circulatingSupply: circulating ? +formatBigInt(circulating) : 0,
      }
    },
    {
      enabled: Boolean(loadData),
      refetchInterval: SLOW_INTERVAL,
    },
  )
  const wdneroPriceBusd = useWDneroPrice()
  const mcap = wdneroPriceBusd.times(circulatingSupply)
  const mcapString = formatLocalisedCompactNumber(mcap.toNumber(), isMobile)

  useEffect(() => {
    if (isIntersecting) {
      setLoadData(true)
    }
  }, [isIntersecting])

  return (
    <StyledWrapper mb={isMobile ? '30px' : '50px'}>
      <StyledColumn>
        <Text color="text" bold fontSize={isMobile ? '14px' : undefined}>
          {t('Circulating Supply')}
        </Text>
        {circulatingSupply ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px" bold value={circulatingSupply} color="secondary" />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      <StyledColumn noMobileBorder>
        <Text bold fontSize={isMobile ? '14px' : undefined}>
          {t('Total supply')}
        </Text>
        {cakeSupply ? (
          <Balance color="secondary" decimals={0} lineHeight="1.1" fontSize="24px" bold value={cakeSupply} />
        ) : (
          <>
            <div ref={observerRef} />
            <Skeleton height={24} width={126} my="4px" />
          </>
        )}
      </StyledColumn>
      <StyledColumn>
        <Text bold fontSize={isMobile ? '14px' : undefined}>
          {t('Market cap')}
        </Text>
        {mcap?.gt(0) && mcapString ? (
          <Heading color="secondary" scale="lg">
            {t('$%marketCap%', { marketCap: mcapString })}
          </Heading>
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      <StyledColumn>
        <Text bold fontSize={isMobile ? '14px' : undefined}>
          {t('Token Burn')}
        </Text>
        {burnedBalance ? (
          <Balance color="secondary" decimals={0} lineHeight="1.1" fontSize="24px" bold value={burnedBalance} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      <StyledColumn>
        <Text bold>{t('Current emissions')}</Text>

        {emissionsPerBlock ? (
          <Heading color="secondary" scale="lg">
            {t('%cakeEmissions%/block', { cakeEmissions: formatNumber(emissionsPerBlock) })}
          </Heading>
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
    </StyledWrapper>
  )
}

export default WDneroDataRow
