import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { STATE_NAME, WalletStatus } from './state'

export const getWalletStatus = (state: RootState) => state[STATE_NAME].walletStatus
export const isWalletLoading = createSelector(
  getWalletStatus,
  (walletStatus) => walletStatus !== WalletStatus.CONNECTED && walletStatus !== WalletStatus.DISCONNECTED
)
export const getETHManager = (state: RootState) => state[STATE_NAME].ethManager
export const getAddress = (state: RootState) => state[STATE_NAME].address
export const getShortAddress = createSelector(getAddress, (address) =>
  address ? `${address.slice(0, 8)}...${address.slice(-8)}` : null
)
export const getJWS = (state: RootState) => state[STATE_NAME].jwsToken
export const getProviderFromIframe = (state: RootState) => state[STATE_NAME].providerFromIframe
