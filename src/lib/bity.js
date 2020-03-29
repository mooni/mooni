import axios from 'axios';

const API_URL = 'https://exchange.api.bity.com';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

function removeEmptyStrings(data = {}) {
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

  async estimate({ inputCurrency, outputCurrency, amount, tradeExact }) {
    const body = {
      input: {
        currency: inputCurrency,
      },
      output: {
        currency: outputCurrency,
      },
    };

    if(tradeExact === 'INPUT')
      body.input.amount = String(amount); else
    if(tradeExact === 'OUTPUT')
      body.output.amount = String(amount);
    else
      throw new Error('invalid TRADE_EXACT');

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
      tradeExact,
      fees: {
        amount: data.price_breakdown.customer_trading_fee.amount,
        currency: data.price_breakdown.customer_trading_fee.currency,
      }
    };
  },

  async order({ fromAddress, recipient, reference, rateRequest, contactPerson }) {

    const body = {
      input: {
        currency: rateRequest.inputCurrency,
        type: 'crypto_address',
        crypto_address: fromAddress,
      },
      output: {
        type: 'bank_account',
        owner: removeEmptyStrings(recipient.owner),
        iban: recipient.iban,
        bic_swift: recipient.bic_swift,
        currency: rateRequest.outputCurrency,
        reference: reference,
      },
    };

    if(rateRequest.tradeExact === 'INPUT')
      body.input.amount = String(rateRequest.amount); else
    if(rateRequest.tradeExact === 'OUTPUT')
      body.output.amount = String(rateRequest.amount);
    else
      throw new Error('invalid TRADE_EXACT');

    const cleanContactPerson = removeEmptyStrings(contactPerson);
    if(cleanContactPerson.email) {
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

      const { data } = await instance({
        method: 'get',
        url: headers.location,
        withCredentials: true,
      });

      if(!data.input) {
        const cookieError = new Error('api_error');
        cookieError.errors = [{code: 'cookie', message: 'your browser does not support cookies'}];
        throw cookieError;
      }

      return {
        ...data,
        fees: {
          amount: data.price_breakdown.customer_trading_fee.amount,
          currency: data.price_breakdown.customer_trading_fee.currency,
        }
      };

    } catch(error) {
      if(error?.response?.data?.errors) {
        const apiError = new Error('api_error');
        apiError.errors = error.response.data.errors;
        throw apiError;
      } else {
        throw error;
      }
    }
  },
  async getOrderDetails(orderId) {
    const { data } = await instance({
      method: 'get',
      url: `/v2/orders/${orderId}`,
      withCredentials: true,
    });

    let paymentStatus = 'waiting';
    if(data.timestamp_cancelled) {
      paymentStatus = 'cancelled';
    } else if(data.timestamp_executed) {
      paymentStatus = 'executed';
    } else if(data.timestamp_payment_received) {
      paymentStatus = 'received';
    }

    data.paymentStatus = paymentStatus;

    return data;
  },

  getOrderStatusPageURL(orderId) {
    return `https://go.bity.com/order-status?id=${orderId}`;
  }
};

export default Bity;
