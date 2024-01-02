import { useCallback } from 'react'
import { LinkExternal, Text } from '@dneroswap/uikit'
import { TransactionErrorContent } from '@dneroswap/widgets-internal'
import { useTranslation } from '@dneroswap/localization'

const DneroswapRouterSlippageErrorMsg =
  'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'

export const SwapTransactionErrorContent = ({ onDismiss, message, openSettingModal }) => {
  const isSlippagedErrorMsg = message?.includes(DneroswapRouterSlippageErrorMsg)

  const handleErrorDismiss = useCallback(() => {
    onDismiss?.()
    if (isSlippagedErrorMsg && openSettingModal) {
      openSettingModal()
    }
  }, [isSlippagedErrorMsg, onDismiss, openSettingModal])
  const { t } = useTranslation()

  return isSlippagedErrorMsg ? (
    <TransactionErrorContent
      message={
        <>
          <Text mb="16px">
            {t(
              'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your',
            )}{' '}
            <Text bold display="inline" style={{ cursor: 'pointer' }} onClick={handleErrorDismiss}>
              <u>{t('slippage tolerance.')}</u>
            </Text>
          </Text>
          <LinkExternal
            href="https://docs.pancakeswap.finance/products/pancakeswap-exchange/trade-guide"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('What are the potential issues with the token?')}
          </LinkExternal>
        </>
      }
    />
  ) : (
    <TransactionErrorContent message={message} onDismiss={onDismiss} />
  )
}
