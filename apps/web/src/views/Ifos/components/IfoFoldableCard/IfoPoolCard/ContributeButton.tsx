import { useTranslation } from '@dneroswap/localization'
import { useMemo } from 'react'
import { Button, IfoGetTokenModal, useModal, useToast } from '@dneroswap/uikit'
import { getTokenListTokenUrl, getTokenLogoURLByAddress } from '@dneroswap/widgets-internal'
import BigNumber from 'bignumber.js'
import { ToastDescriptionWithTx } from 'components/Toast'
import { Ifo, PoolIds } from '@dneroswap/ifos'
import { useTokenBalanceByChain } from 'hooks/useTokenBalance'
import { useCurrentBlock } from 'state/block/hooks'
import { getBalanceNumber } from '@dneroswap/utils/formatBalance'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'

import ContributeModal from './ContributeModal'

interface Props {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
}
const ContributeButton: React.FC<React.PropsWithChildren<Props>> = ({ poolId, ifo, publicIfoData, walletIfoData }) => {
  const publicPoolCharacteristics = publicIfoData[poolId]
  const userPoolCharacteristics = walletIfoData[poolId]
  const isPendingTx = userPoolCharacteristics?.isPendingTx
  const amountTokenCommittedInLP = userPoolCharacteristics?.amountTokenCommittedInLP
  const limitPerUserInLP = publicPoolCharacteristics?.limitPerUserInLP
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const currentBlock = useCurrentBlock()
  const { balance: userCurrencyBalance } = useTokenBalanceByChain(ifo.currency.address, ifo.chainId)
  const currencyImageUrl = useMemo(
    () => getTokenListTokenUrl(ifo.currency) || getTokenLogoURLByAddress(ifo.currency.address, ifo.currency.chainId),
    [ifo.currency],
  )

  // Refetch all the data, and display a message when fetching is done
  const handleContributeSuccess = async (amount: BigNumber, txHash: string) => {
    await Promise.all([publicIfoData.fetchIfoData(currentBlock), walletIfoData.fetchIfoData()])
    toastSuccess(
      t('Success!'),
      <ToastDescriptionWithTx txHash={txHash}>
        {t('You have contributed %amount% WDNERO to this IFO!', {
          amount: getBalanceNumber(amount),
        })}
      </ToastDescriptionWithTx>,
    )
  }

  const [onPresentContributeModal] = useModal(
    <ContributeModal
      poolId={poolId}
      creditLeft={walletIfoData.ifoCredit?.creditLeft || new BigNumber(0)}
      ifo={ifo}
      publicIfoData={publicIfoData}
      walletIfoData={walletIfoData}
      onSuccess={handleContributeSuccess}
      userCurrencyBalance={userCurrencyBalance}
    />,
    false,
  )

  const [onPresentGetTokenModal] = useModal(
    <IfoGetTokenModal symbol={ifo.currency.symbol} address={ifo.currency.address} imageSrc={currencyImageUrl || ''} />,
    false,
  )

  const noNeedCredit = ifo.version >= 3.1 && poolId === PoolIds.poolBasic

  const isMaxCommitted =
    (!noNeedCredit &&
      walletIfoData.ifoCredit?.creditLeft &&
      walletIfoData.ifoCredit?.creditLeft.isLessThanOrEqualTo(0)) ||
    (limitPerUserInLP?.isGreaterThan(0) && amountTokenCommittedInLP?.isGreaterThanOrEqualTo(limitPerUserInLP))

  const isDisabled = isPendingTx || isMaxCommitted || publicIfoData.status !== 'live'

  return (
    <Button
      onClick={userCurrencyBalance.isEqualTo(0) ? onPresentGetTokenModal : onPresentContributeModal}
      width="100%"
      disabled={isDisabled}
    >
      {isMaxCommitted && publicIfoData.status === 'live' ? t('Max. Committed') : t('Commit WDNERO')}
    </Button>
  )
}

export default ContributeButton
