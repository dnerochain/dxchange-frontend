import { styled } from 'styled-components'
import { Skeleton, Text, Flex, Box, useModal, useMatchBreakpoints, Balance } from '@dneroswap/uikit'
import { Pool } from '@dneroswap/widgets-internal'

import BigNumber from 'bignumber.js'
import { PoolCategory } from 'config/constants/types'
import { BIG_ZERO } from '@dneroswap/utils/bigNumber'
import { formatNumber, getBalanceNumber, getFullDisplayBalance } from '@dneroswap/utils/formatBalance'
import { useTranslation } from '@dneroswap/localization'
import { Token } from '@dneroswap/sdk'
import CollectModal from '../../Modals/CollectModal'

interface EarningsCellProps {
  pool: Pool.DeserializedPool<Token>
  account: string
}

const StyledCell = styled(Pool.BaseCell)`
  flex: 4.5;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 120px;
  }
`

const EarningsCell: React.FC<React.PropsWithChildren<EarningsCellProps>> = ({ pool, account }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { sousId, earningToken, poolCategory, userData, earningTokenPrice } = pool

  const earnings = userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO
  const earningTokenBalance = getBalanceNumber(earnings, earningToken.decimals)
  const earningTokenDollarBalance = getBalanceNumber(
    earnings.multipliedBy(earningTokenPrice ?? 0),
    earningToken.decimals,
  )
  const hasEarnings = account && earnings.gt(0)
  const fullBalance = getFullDisplayBalance(earnings, earningToken.decimals)
  const formattedBalance = formatNumber(earningTokenBalance, 3, 3)
  const isDTokenPool = poolCategory === PoolCategory.DNEROCHAIN

  const labelText = t('%asset% Earned', { asset: earningToken.symbol })

  const [onPresentCollect] = useModal(
    <CollectModal
      formattedBalance={formattedBalance}
      fullBalance={fullBalance}
      earningTokenSymbol={earningToken.symbol}
      earningsDollarValue={earningTokenDollarBalance}
      sousId={sousId}
      isDTokenPool={isDTokenPool}
    />,
  )

  const handleEarningsClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    onPresentCollect()
  }

  return (
    <StyledCell role="cell">
      <Pool.CellContent>
        {pool?.totalStaked?.gte(0) ? (
          <>
            <Text fontSize="12px" color="textSubtle" textAlign="left">
              {labelText}
            </Text>
            <Flex>
              <Box mr="8px" height="32px" onClick={hasEarnings ? handleEarningsClick : undefined}>
                <Balance
                  mt="4px"
                  bold={!isMobile}
                  fontSize={isMobile ? '14px' : '16px'}
                  color={hasEarnings ? 'primary' : 'textDisabled'}
                  decimals={hasEarnings ? 5 : 1}
                  value={hasEarnings ? earningTokenBalance : 0}
                />
                {hasEarnings ? (
                  <>
                    {new BigNumber(earningTokenPrice ?? 0).gt(0) && (
                      <Balance
                        display="inline"
                        fontSize="12px"
                        color="textSubtle"
                        decimals={2}
                        prefix="~"
                        value={earningTokenDollarBalance}
                        unit=" USD"
                      />
                    )}
                  </>
                ) : (
                  <Text mt="4px" fontSize="12px" color="textDisabled">
                    0 USD
                  </Text>
                )}
              </Box>
            </Flex>
          </>
        ) : (
          <>
            <Skeleton width="30px" height="12px" mb="4px" />
            <Skeleton width="80px" height="12px" />
          </>
        )}
      </Pool.CellContent>
    </StyledCell>
  )
}

export default EarningsCell
