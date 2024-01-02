import { useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from '@dneroswap/localization'
import { useRouter } from 'next/router'
import { Button, useToast, AutoRenewIcon } from '@dneroswap/uikit'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from '@dneroswap/utils/bigNumber'
import { masterChefV3Addresses } from '@dneroswap/farms'
import { getDecimalAmount, getFullDisplayBalance } from '@dneroswap/utils/formatBalance'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { LiquidStakingList } from 'views/LiquidStaking/constants/types'
import { Currency, CurrencyAmount, ERC20Token } from '@dneroswap/sdk'
import { useLiquidStakingApprove } from 'views/LiquidStaking/hooks/useLiquidStakingApprove'
import { useLiquidStakingApprovalStatus } from 'views/LiquidStaking/hooks/useLiquidStakingApprovalStatus'
import { useCallStakingContract } from 'views/LiquidStaking/hooks/useCallStakingContract'

interface LiquidStakingButtonProps {
  quoteAmount: BigNumber
  inputCurrency: Currency | ERC20Token
  currentAmount: BigNumber
  selectedList: LiquidStakingList
  currencyBalance: CurrencyAmount<Currency>
}

const LiquidStakingButton: React.FC<LiquidStakingButtonProps> = ({
  quoteAmount,
  inputCurrency,
  currentAmount,
  selectedList,
  currencyBalance,
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { account, chainId } = useAccountActiveChain()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading } = useCatchTxError()

  const masterChefAddress = masterChefV3Addresses[chainId]
  const stakingCall = useCallStakingContract(selectedList)

  const balance = useMemo(
    () => (currencyBalance ? new BigNumber(currencyBalance.quotient.toString()) : BIG_ZERO),
    [currencyBalance],
  )

  const convertedStakeAmount =
    currentAmount && inputCurrency ? getDecimalAmount(currentAmount, inputCurrency.decimals) : BIG_ZERO

  const { isApproved, allowance, setLastUpdated } = useLiquidStakingApprovalStatus({
    approveToken: selectedList?.approveToken?.address,
    contractAddress: selectedList?.contract,
    shouldCheckApproval: selectedList?.shouldCheckApproval,
  })

  const { isPending, onApprove } = useLiquidStakingApprove({
    approveToken: selectedList?.approveToken?.address,
    contractAddress: selectedList?.contract,
  })

  const isApprovedEnough = useMemo(
    () => !selectedList?.shouldCheckApproval || (isApproved && allowance?.isGreaterThanOrEqualTo(convertedStakeAmount)),
    [allowance, convertedStakeAmount, isApproved, selectedList?.shouldCheckApproval],
  )

  useEffect(() => {
    if (selectedList?.shouldCheckApproval) {
      setLastUpdated()
    }
  }, [isPending, setLastUpdated, selectedList])

  const onStake = useCallback(async () => {
    if (!convertedStakeAmount || !account) return

    const receipt = await fetchWithCatchTxError(() => {
      return stakingCall(
        { masterChefAddress, convertedStakeAmount: BigInt(convertedStakeAmount.toString()) },
        {
          value: BigInt(convertedStakeAmount.toString()),
        },
      )
    })

    const decimals = selectedList?.token0?.decimals
    if (receipt?.status && quoteAmount) {
      toastSuccess(
        t('Staked!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {`${t('Received')} ${getFullDisplayBalance(quoteAmount, 0, decimals)} ${selectedList?.token1.symbol}`}
        </ToastDescriptionWithTx>,
      )

      router.push('/liquid-staking')
    }
  }, [
    account,
    convertedStakeAmount,
    fetchWithCatchTxError,
    masterChefAddress,
    quoteAmount,
    router,
    selectedList,
    stakingCall,
    t,
    toastSuccess,
  ])

  const error = useMemo(() => {
    if (convertedStakeAmount?.isGreaterThan(balance)) {
      return t('Insufficient Balance')
    }
    if (convertedStakeAmount?.toString()?.includes('.') || !currentAmount?.isGreaterThan(0)) {
      return t('Enter an amount')
    }
    return ''
  }, [balance, convertedStakeAmount, currentAmount, t])

  if (!account) {
    return <ConnectWalletButton width="100%" />
  }

  if (error) {
    return (
      <Button disabled width="100%">
        {error}
      </Button>
    )
  }

  if (!isApprovedEnough) {
    return (
      <Button
        endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : undefined}
        isLoading={isPending}
        onClick={() => {
          onApprove()
        }}
        width="100%"
      >
        {isPending ? t('Enabling') : t('Enable')}
      </Button>
    )
  }

  return (
    <Button
      width="100%"
      endIcon={loading ? <AutoRenewIcon spin color="currentColor" /> : undefined}
      isLoading={loading}
      onClick={onStake}
    >
      {loading ? `${t('Staking')}` : t('Stake')}
    </Button>
  )
}

export default LiquidStakingButton
