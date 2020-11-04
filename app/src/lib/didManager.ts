import { providers, utils } from 'ethers';
import { Base64 } from 'js-base64';
import { v4 as uuidv4 } from 'uuid';
import store from 'store2';

const tokenDuration = 1000 * 60 * 60 * 24 * 7; // 7 days

export type Claim = {
  iat: Date;
  exp: Date;
  iss: string;
  aud: string;
  tid: string;
};

export type Token = {
  claim: Claim;
  signature: string;
  data: string;
}

const DIDManager = {
  async getJWS(provider: providers.Web3Provider) {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const existingJWS = store.get(`jws:${address}`);
    if(existingJWS) {
      const token = DIDManager.decodeToken(existingJWS);
      if(token.claim.exp > new Date()) {
        return existingJWS;
      }
    }
    const token = await DIDManager.createToken(provider);
    store.set(`jws:${address}`, token);
    return token;
  },

  async createToken(
    provider: providers.Web3Provider,
  ): Promise<string> {
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const iat = +new Date();

    const claim = {
      iat: +new Date(),
      exp: iat + tokenDuration,
      iss: address,
      aud: 'mooni',
      tid: uuidv4(),
    };

    const serializedClaim = JSON.stringify(claim);
    const signature = await signer.signMessage(serializedClaim);

    return Base64.encode(JSON.stringify([signature, serializedClaim]));
  },

  decodeToken: function (token: string): Token {
    let signature: string, rawClaim: string, claim: Claim;

    try {
      const rawToken = Base64.decode(token);
      [signature, rawClaim] = JSON.parse(rawToken);
      claim = JSON.parse(rawClaim);
    } catch (error) {
      throw new Error('invalid token');
    }
    try {
      const signerAddress = utils.verifyMessage(rawClaim, signature);
      if (signerAddress !== claim.iss) {
        throw new Error('invalid signer address');
      }
    } catch (error) {
      throw new Error('invalid signature');
    }

    return {
      claim,
      signature,
      data: token,
    };
  },

};

export default DIDManager;
