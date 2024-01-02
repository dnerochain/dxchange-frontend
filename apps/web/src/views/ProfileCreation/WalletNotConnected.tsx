import { Heading, Text } from '@dneroswap/uikit'
import { useTranslation } from '@dneroswap/localization'
import ConnectWalletButton from 'components/ConnectWalletButton'

const WalletNotConnected = () => {
  const { t } = useTranslation()

  return (
    <div>
      <Heading scale="xl" mb="8px">
        {t('Oops!')}
      </Heading>
      <Text as="p" mb="16px">
        {t('Please connect your wallet to continue')}
      </Text>
      <ConnectWalletButton />
    </div>
  )
}

export default WalletNotConnected
