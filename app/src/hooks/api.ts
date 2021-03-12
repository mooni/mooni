import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { getJWS } from '../redux/wallet/selectors'
import { useCallback } from 'react'
import MooniAPI from '../lib/wrappers/mooni'

export const useMooniApi = (endpoint) => {
  const jwsToken = useSelector(getJWS)
  const fetcher = useCallback((endpoint) => MooniAPI.getUrl(endpoint, jwsToken), [jwsToken])
  return useSWR(endpoint, fetcher)
}
