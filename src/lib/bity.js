import axios from 'axios';

const API_URL = 'https://exchange.api.bity.com';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

function removeEmptyStrings(data) {
  return Object.keys(data).reduce((acc, prop) => {
      if(data[prop] !== '' && data[prop] !== undefined) {
        return Object.assign(acc, { [prop]: data[prop] });
      }
      return acc;
    },
    {});
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
      inputAmount: data.input.amount,
      outputAmount: data.output.amount,
      inputCurrency,
      outputCurrency,
    };
  },
  async order({ fromAddress, recipient, reference, paymentDetail, contactPerson }) {
    const body = {
      input: {
        currency: paymentDetail.inputCurrency,
        type: 'crypto_address',
        crypto_address: fromAddress,
      },
      output: {
        type: 'bank_account',
        owner: removeEmptyStrings(recipient.owner),
        iban: recipient.iban,
        bic_swift: recipient.bic_swift,
        currency: paymentDetail.outputCurrency,
        amount: String(paymentDetail.outputAmount),
        reference: reference,
      },
    };

    if(contactPerson) {
      body.contact_person = {
        email: contactPerson.email,
      };
    }

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
      if(error && error.response && error.response.data && error.response.data.errors) {
        const apiError = new Error('api_error');
        apiError.errors = error.response.data.errors;
        throw apiError;
      } else {
        throw error;
      }
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

  getOrderStatusPage(orderId) {
    return `https://go.bity.com/order-status?id=${orderId}`;
  }
};

export default Bity;
