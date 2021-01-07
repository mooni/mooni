import ETHManager from "../../lib/eth";

export const STATE_NAME = 'ETH';

export interface WalletState {
  ethManager: ETHManager | null;
  ethManagerLoading: boolean;
  address: string | null;
  jwsToken: string | null;
  providerFromIframe: boolean;
}

export const initialState: WalletState = {
  ethManager: null,
  ethManagerLoading: false,
  address: null,
  jwsToken: null,
  providerFromIframe: false,
};
