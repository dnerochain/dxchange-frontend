import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'DxChange',
  description: 'The most popular AMM on BSC by user count! Earn CAKE through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by DxChange), NFTs, and more, on a platform you can trust.',
  image: 'https://app.luchowswap.com/assets/images/banner.jpg',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  let basePath
  if (path.startsWith('/swap')) {
    basePath = '/swap'
  } else if (path.startsWith('/add')) {
    basePath = '/add'
  } else if (path.startsWith('/remove')) {
    basePath = '/remove'
  } else if (path.startsWith('/teams')) {
    basePath = '/teams'
  } else if (path.startsWith('/voting/proposal') && path !== '/voting/proposal/create') {
    basePath = '/voting/proposal'
  } else if (path.startsWith('/nfts/collections')) {
    basePath = '/nfts/collections'
  } else if (path.startsWith('/nfts/profile')) {
    basePath = '/nfts/profile'
  } else if (path.startsWith('/pancake-squad')) {
    basePath = '/pancake-squad'
  } else {
    basePath = path
  }

  switch (basePath) {
    case '/':
      return {
        title: `${t('Home')} | ${t('DxChange')}`,
      }
    case '/swap':
      return {
        title: `${t('Exchange')} | ${t('DxChange')}`,
      }
    case '/add':
      return {
        title: `${t('Add Liquidity')} | ${t('DxChange')}`,
      }
    case '/remove':
      return {
        title: `${t('Remove Liquidity')} | ${t('DxChange')}`,
      }
    case '/liquidity':
      return {
        title: `${t('Liquidity')} | ${t('DxChange')}`,
      }
    case '/find':
      return {
        title: `${t('Import Pool')} | ${t('DxChange')}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('DxChange')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('DxChange')}`,
      }
    case '/prediction/leaderboard':
      return {
        title: `${t('Leaderboard')} | ${t('DxChange')}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('DxChange')}`,
      }
    case '/farms/auction':
      return {
        title: `${t('Farm Auctions')} | ${t('DxChange')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('DxChange')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('DxChange')}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('DxChange')}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('DxChange')}`,
      }
    case '/voting':
      return {
        title: `${t('Voting')} | ${t('DxChange')}`,
      }
    case '/voting/proposal':
      return {
        title: `${t('Proposals')} | ${t('DxChange')}`,
      }
    case '/voting/proposal/create':
      return {
        title: `${t('Make a Proposal')} | ${t('DxChange')}`,
      }
    case '/info':
      return {
        title: `${t('Overview')} | ${t('DxChange Info & Analytics')}`,
        description: 'View statistics for DxChange exchanges.',
      }
    case '/info/pools':
      return {
        title: `${t('Pools')} | ${t('DxChange Info & Analytics')}`,
        description: 'View statistics for DxChange exchanges.',
      }
    case '/info/tokens':
      return {
        title: `${t('Tokens')} | ${t('DxChange Info & Analytics')}`,
        description: 'View statistics for DxChange exchanges.',
      }
    case '/nfts':
      return {
        title: `${t('Overview')} | ${t('DxChange')}`,
      }
    case '/nfts/collections':
      return {
        title: `${t('Collections')} | ${t('DxChange')}`,
      }
    case '/nfts/profile':
      return {
        title: `${t('Your Profile')} | ${t('DxChange')}`,
      }
    case '/luchow-squad':
      return {
        title: `${t('Luchow Squad')} | ${t('DxChange')}`,
      }
    default:
      return null
  }
}
