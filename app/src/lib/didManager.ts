import { providers, utils } from 'ethers';
import { Base64 } from 'js-base64';
import { v4 as uuidv4 } from 'uuid';
import { store } from './store'
import { shittySigner } from './eth';

const tokenDuration = 1000 * 60 * 60 * 24 * 7; // 7 days

export type Claim = {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  tid: string;
};

export type Token = {
  claim: Claim;
  signature: string;
  serializedToken: string;
}

const FRIENDLY_STRING = "Please sign this message to login to Mooni: ";

function serializeClaim(claim: Claim): string {
  return `${FRIENDLY_STRING}${JSON.stringify(claim)}`;
}
function deserializeClaim(serializedClaim: string): Claim {
  return JSON.parse(serializedClaim.slice(FRIENDLY_STRING.length));
}

const DIDManager = {
  async getJWS(provider: providers.Web3Provider): Promise<string> {
    const signer = provider.getSigner();
    const address = (await signer.getAddress()).toLowerCase();
    const existingJWS = store.get(`jws:${address}`);
    if(existingJWS) {
      const token = DIDManager.decodeToken(existingJWS);
      if(token.claim.exp > +new Date()) {
        return existingJWS;
      }
    }
    const token = await DIDManager.createToken(provider);
    store.set(`jws:${address}`, token);
    return token;
  },

  removeStore(address) {
    store.remove(`jws:${address.toLowerCase()}`);
  },

  async createToken(
    provider: providers.Web3Provider,
  ): Promise<string> {
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const iat = +new Date();

    const claim: Claim = {
      iat: +new Date(),
      exp: iat + tokenDuration,
      iss: address,
      aud: 'mooni',
      tid: uuidv4(),
    };

    const serializedClaim = serializeClaim(claim);
    const signature = await shittySigner(provider, serializedClaim);

    return Base64.encode(JSON.stringify([signature, serializedClaim]));
  },

  decodeToken: function (serializedToken: string): Token {
    let signature: string, serializedClaim: string, claim: Claim;

    try {
      [signature, serializedClaim] = JSON.parse(Base64.decode(serializedToken));
      claim = deserializeClaim(serializedClaim);
    } catch (error) {
      throw new Error('error while deserializing token');
    }
    let signerAddress;
    try {
      if(!signature) throw new Error('no signature found in token')
      signerAddress = utils.verifyMessage(serializedClaim, signature);
    } catch (error) {
      console.error(error);
      throw new Error('invalid signature');
    }

    if (signerAddress !== claim.iss) {
      throw new Error('invalid signer address');
    }

    return {
      claim,
      signature,
      serializedToken,
    };
  },
};

export default DIDManager;
