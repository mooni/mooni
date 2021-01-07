import ETHManager from "../../lib/eth";

export const STATE_NAME = 'WALLET';

export enum WalletStatus {
  DISCONNECTED= 'DISCONNECTED',
  WAITING_APPROVAL= 'WAITING_APPROVAL',
  WAITING_SIGNATURE= 'WAITING_SIGNATURE',
  LOADING= 'LOADING',
  CONNECTED= 'CONNECTED',
  DISCONNECTING= 'DISCONNECTING',
}

export interface WalletState {
  ethManager: ETHManager | null;
  walletStatus: WalletStatus;
  address: string | null;
  jwsToken: string | null;
  providerFromIframe: boolean;
}

export const initialState: WalletState = {
  ethManager: null,
  walletStatus: WalletStatus.DISCONNECTED,
  address: null,
  jwsToken: null,
  providerFromIframe: false,
};
