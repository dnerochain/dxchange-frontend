import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { nftSaleABI } from 'config/abi/nftSale'
import { useProfile } from 'state/profile/hooks'
import ArtistSection from './components/ArtistSection'
import BunniesSection from './components/BunniesSection'
import EventDescriptionSection from './components/EventDescriptionSection'
import EventStepsSection from './components/EventStepsSection'
import FaqSection from './components/FaqSection'
import DneroswapSquadHeader from './components/Header'
import { DneroswapSquadContext } from './context'
import useEventInfos from './hooks/useEventInfos'
import useUserInfos from './hooks/useUserInfos'
import { StyledSquadContainer } from './styles'
import { EventInfos, UserInfos } from './types'
import { getUserStatus } from './utils'

const REFRESH_INTERVAL = 4000

const DneroswapSquad: React.FC<React.PropsWithChildren> = () => {
  const { address: account } = useAccount()
  const { hasProfile, isInitialized } = useProfile()
  const [eventInfos, setEventInfo] = useState<EventInfos>()
  const [userInfos, setUserInfos] = useState<UserInfos>()
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [isUserEnabled, setIsUserEnabled] = useState(false)
  const isLoading = (!eventInfos || !userInfos) && nftSaleABI?.length > 0

  useEventInfos({ setCallback: setEventInfo, refreshCounter })
  useUserInfos({ setCallback: setUserInfos, refreshCounter, account })

  const userStatus = getUserStatus({
    account,
    hasActiveProfile: hasProfile && isInitialized,
    hasGen0: userInfos?.canClaimForGen0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCounter((prev) => prev + 1)
    }, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (account) {
      setIsUserEnabled(false)
      setUserInfos(undefined)
    }
  }, [account])

  return (
    <DneroswapSquadContext.Provider value={{ isUserEnabled, setIsUserEnabled }}>
      <StyledSquadContainer>
        <DneroswapSquadHeader
          account={account}
          isLoading={isLoading}
          userInfos={userInfos}
          eventInfos={eventInfos}
          userStatus={userStatus}
        />
        <BunniesSection />
        <EventDescriptionSection />
        <EventStepsSection
          userInfos={userInfos}
          eventInfos={eventInfos}
          userStatus={userStatus}
          isLoading={isLoading}
          account={account}
        />
        <ArtistSection />
        <FaqSection />
      </StyledSquadContainer>
    </DneroswapSquadContext.Provider>
  )
}

export default DneroswapSquad
