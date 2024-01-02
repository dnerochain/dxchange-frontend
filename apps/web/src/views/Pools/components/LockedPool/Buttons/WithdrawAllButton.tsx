import { useTranslation } from '@dneroswap/localization'
import { Button, ButtonProps, useToast } from '@dneroswap/uikit'
import { memo, useCallback } from 'react'

import { useAccount } from 'wagmi'
import { ToastDescriptionWithTx } from 'components/Toast'
import { vaultPoolConfig } from 'config/constants/pools'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { useVaultPoolContract } from 'hooks/useContract'
import { useAppDispatch } from 'state'
import { fetchWDneroVaultUserData } from 'state/pools'
import { VaultKey } from 'state/types'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useQueryClient } from '@tanstack/react-query'

const WithdrawAllButton: React.FC<React.PropsWithChildren<ButtonProps>> = (props) => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveChainId()

  const { address: account } = useAccount()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const vaultPoolContract = useVaultPoolContract(VaultKey.WDneroVault)
  const { callWithGasPrice } = useCallWithGasPrice()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toastSuccess } = useToast()

  const handleUnlock = useCallback(async () => {
    if (!account || !chainId) return
    const callOptions = {
      gas: vaultPoolConfig[VaultKey.WDneroVault].gasLimit,
    }
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(vaultPoolContract, 'withdrawAll', [], callOptions)
    })

    if (receipt?.status) {
      toastSuccess(
        t('Withdrawn!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('Your funds have been withdrawn')}
        </ToastDescriptionWithTx>,
      )
      dispatch(fetchWDneroVaultUserData({ account, chainId }))
      queryClient.invalidateQueries(['userWDneroLockStatus', account])
    }
  }, [
    t,
    toastSuccess,
    account,
    callWithGasPrice,
    dispatch,
    fetchWithCatchTxError,
    vaultPoolContract,
    queryClient,
    chainId,
  ])

  return (
    <Button width="100%" disabled={pendingTx} onClick={handleUnlock} variant="secondary" {...props}>
      {pendingTx ? t('Withdrawing...') : t('Withdraw All')}
    </Button>
  )
}

export default memo(WithdrawAllButton)
