import ETHManager from "../../lib/eth";

export const STATE_NAME = 'WALLET';

export interface WalletState {
  ethManager: ETHManager | null;
  walletLoading: boolean;
  address: string | null;
  jwsToken: string | null;
  providerFromIframe: boolean;
}

export const initialState: WalletState = {
  ethManager: null,
  walletLoading: false,
  address: null,
  jwsToken: null,
  providerFromIframe: false,
};
