import axios from 'axios';

const API_URL = 'https://exchange.api.bity.com';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

class CustomError extends Error {
  constructor(message, details = {}, code = null) {
    super(message);
    this.details = details;
    this.code = code || null;
    //console.error(this.message, this.details, this.code);
  }
}

const Bity = {
  async getCurrencies(tags = []) {
    const params = {
      tags: tags.join(','),
    };

    const { data } = await instance({
      method: 'get',
      url: '/v2/currencies',
      params,
    });

    return data.currencies.map(currency => currency.code);
  },

  async estimate({ inputCurrency, outputCurrency, inputAmount = null, outputAmount = null }) {
    if(inputAmount && outputAmount) throw new Error('please only provide input or output amount');

    const body = {
      input: {
        currency: inputCurrency,
      },
      output: {
        currency: outputCurrency,
      },
    };

    if(inputAmount) body.input.amount = String(inputAmount);
    if(outputAmount) body.output.amount = String(outputAmount);

    const { data } = await instance({
      method: 'post',
      url: '/v2/orders/estimate',
      data: body,
    });

    return {
      inputAmount: inputAmount || data.input.amount,
      outputAmount: outputAmount || data.output.amount,
      inputCurrency,
      outputCurrency,
    };
  },
  async order({ fromAddress, recipient, paymentDetail }) {
    const body = {
      input: {
        currency: "ETH",
        type: 'crypto_address',

        crypto_address: fromAddress,
      },
      output: {
        type: 'bank_account',

        owner: recipient.owner,
        iban: recipient.iban,
        bic_swift: recipient.bic_swift,

        currency: paymentDetail.outputCurrency,
        amount: String(paymentDetail.outputAmount),
        reference: paymentDetail.reference,
      },
    };

    try {
      const { headers } = await instance({
        method: 'post',
        url: '/v2/orders',
        data: body,
        withCredentials: true,
      });

      const order = await Bity.getOrder(headers.location);
      return order;
    } catch(error) {
      if(error.response) {
        throw new CustomError('create order error', error.response.data.errors, error.response.status);
      }
      throw error;
    }
  },
  async getOrder(orderLocation) {
    const { data } = await instance({
      method: 'get',
      url: orderLocation,
      withCredentials: true,
    });
    return data;
  },
};

export default Bity;
