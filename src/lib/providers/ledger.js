import ProviderEngine from 'web3-provider-engine';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import TransporWebUSB from "@ledgerhq/hw-transport-webusb";
import createLedgerSubprovider from "@ledgerhq/web3-subprovider";

function getInfuraUrl(infuraId) {
  return `https://mainnet.infura.io/v3/${infuraId}`;
}

export default async function createProvider({ infuraId }) {
  const engine = new ProviderEngine();
  const getTransport = () => TransporWebUSB.create();
  const ledger = createLedgerSubprovider(getTransport, {
    accountsLength: 5,
  });
  engine.addProvider(ledger);
  engine.addProvider(new RpcSubprovider({ rpcUrl: getInfuraUrl(infuraId) }));

  engine.enable = () => new Promise((resolve, reject) => {
    engine.sendAsync({ method: 'eth_accounts' }, (error, response) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.result)
      }
    });
  });

  engine.start();
  return engine;
}
