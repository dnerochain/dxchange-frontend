import { bWDneroSupportedChainId } from '@dneroswap/farms'
import { useQuery } from '@tanstack/react-query'
import BN from 'bignumber.js'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useBWDneroFarmBoosterV3Contract, useBWDneroFarmBoosterVeWDneroContract, useMasterchefV3 } from 'hooks/useContract'
import _toNumber from 'lodash/toNumber'
import { useMemo } from 'react'
import { useWDneroLockStatus } from 'views/WDneroStaking/hooks/useVeWDneroUserInfo'
import { WDneroLockStatus } from 'views/WDneroStaking/types'
import { useContractRead } from 'wagmi'
import { PRECISION_FACTOR, getUserMultiplier } from './multiplierAPI'

export const USER_ESTIMATED_MULTIPLIER = 2

const QUERY_SETTINGS_WITHOUT_REFETCH = {
  retry: 3,
  retryDelay: 3000,
  keepPreviousData: true,
}

export const useBakeV3farmCanBoost = (farmPid: number) => {
  const { chainId } = useActiveChainId()
  const farmBoosterV3Contract = useBWDneroFarmBoosterVeWDneroContract()
  const { data } = useContractRead({
    abi: farmBoosterV3Contract.abi,
    address: farmBoosterV3Contract.address,
    chainId,
    functionName: 'whiteList',
    enabled: Boolean(chainId && farmPid && bWDneroSupportedChainId.includes(chainId)),
    args: [BigInt(farmPid ?? 0)],
  })
  return { farmCanBoost: data }
}

export const useIsBoostedPoolLegacy = (tokenId?: string) => {
  const { chainId } = useActiveChainId()
  const farmBoosterV3Contract = useBWDneroFarmBoosterV3Contract()
  const { data, refetch } = useQuery(
    [`v3/bcake/isBoostedPoolLegacy/${chainId}/${tokenId}`],
    () => farmBoosterV3Contract.read.isBoostedPool([BigInt(tokenId ?? 0)]),
    {
      enabled: Boolean(chainId && tokenId && tokenId !== 'undefined'),
      ...QUERY_SETTINGS_WITHOUT_REFETCH,
    },
  )
  return { isBoosted: data?.[0], pid: Number(data?.[1]), mutate: refetch }
}

export const useIsBoostedPool = (tokenId?: string) => {
  const { chainId } = useActiveChainId()
  const farmBoosterV3Contract = useBWDneroFarmBoosterVeWDneroContract()
  const { data, refetch } = useQuery(
    [`v3/bcake/isBoostedPool/${chainId}/${tokenId}`],
    () => farmBoosterV3Contract.read.isBoostedPool([BigInt(tokenId ?? 0)]),
    {
      enabled: Boolean(chainId && tokenId && tokenId !== 'undefined'),
      ...QUERY_SETTINGS_WITHOUT_REFETCH,
    },
  )
  return { isBoosted: data?.[0], pid: Number(data?.[1]), mutate: refetch }
}

export const useUserPositionInfo = (tokenId?: string) => {
  const { chainId } = useActiveChainId()
  const masterChefV3 = useMasterchefV3()
  const { data, refetch } = useQuery(
    [`v3/masterChef/userPositionInfos/${chainId}/${tokenId}`],
    () => masterChefV3?.read.userPositionInfos([BigInt(tokenId ?? 0)]),
    {
      enabled: Boolean(chainId && tokenId),
      ...QUERY_SETTINGS_WITHOUT_REFETCH,
    },
  )
  return {
    data: {
      liquidity: data?.[0],
      boostLiquidity: data?.[1],
      tickLower: data?.[2],
      tickUpper: data?.[3],
      rewardGrowthInside: data?.[4],
      reward: data?.[5],
      user: data?.[6],
      pid: data?.[7],
      boostMultiplier: _toNumber(new BN(data?.[8]?.toString() ?? 0).div(PRECISION_FACTOR).toString()),
    },
    updateUserPositionInfo: refetch,
  }
}

export const useUserBoostedPoolsTokenId = () => {
  const { account, chainId } = useAccountActiveChain()
  const farmBoosterV3Contract = useBWDneroFarmBoosterVeWDneroContract()
  const farmBoosterV3ContractLegacy = useBWDneroFarmBoosterV3Contract()

  const { data, refetch } = useQuery(
    [`v3/bcake/userBoostedPools/${chainId}/${account}`],
    () => farmBoosterV3Contract.read.activedPositions([account ?? '0x']),
    {
      enabled: Boolean(chainId && account),
      ...QUERY_SETTINGS_WITHOUT_REFETCH,
    },
  )

  const { data: dataLegacy, refetch: refetchLegacy } = useQuery(
    [`v3/bcake/userBoostedPoolsLegacy/${chainId}/${account}`],
    () => farmBoosterV3ContractLegacy.read.activedPositions([account ?? '0x']),
    {
      enabled: Boolean(chainId && account),
      ...QUERY_SETTINGS_WITHOUT_REFETCH,
    },
  )
  const tokenIds = data?.map((tokenId) => Number(tokenId)) ?? []
  const tokenIdsLegacy = dataLegacy?.map((tokenId) => Number(tokenId)) ?? []

  return {
    tokenIds: [...tokenIds, ...tokenIdsLegacy],
    updateBoostedPoolsTokenId: () => {
      refetch()
      refetchLegacy()
    },
  }
}

export const useVeWDneroUserMultiplierBeforeBoosted = (tokenId?: string) => {
  const { chainId } = useActiveChainId()
  const farmBoosterV3Contract = useBWDneroFarmBoosterVeWDneroContract()
  const { data, refetch } = useQuery(
    [`v3/bcake/useUserMultiplierBeforeBoosted/${chainId}/${tokenId}`],
    () => getUserMultiplier({ address: farmBoosterV3Contract.address, tokenId, chainId }),
    {
      enabled: Boolean(chainId && tokenId),
      ...QUERY_SETTINGS_WITHOUT_REFETCH,
    },
  )

  return {
    veWDneroUserMultiplierBeforeBoosted: data ? (data > 2 ? 2 : data) : 1,
    updatedUserMultiplierBeforeBoosted: refetch,
  }
}

export const useBWDneroBoostLimitAndLockInfo = () => {
  const { status } = useWDneroLockStatus()
  const isLockEnd = useMemo(() => status === WDneroLockStatus.Expired, [status])
  const locked = useMemo(() => status === WDneroLockStatus.Locking, [status])

  return { locked, isLockEnd }
}