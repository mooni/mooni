import { Reporter } from './reporter'
import { readJSON, writeJSON } from './utils'
import config from './config'

// const wait = time => new Promise(res => setTimeout(res, time))

const now = new Date()
const nowYear = now.getFullYear()
const maxMonth = (nowYear === config.year ?
  now.getMonth()+1
  :
  12
)

export async function getReports(reporter: Reporter) {
  console.log('fetching reports');

  let reports = {};
  try {
    reports = readJSON('./output/reports.json')
  } catch(error) {}

  let year = config.year;
  console.log('year:', year);
  reports[year] = reports[year] || {};

  for(let month = 1; month<=maxMonth; month++) {
    reports[year][month] = await reporter.getMonthReport(month, year)
  }

  writeJSON('./output/reports.json', reports)
}

export async function getOrderIds(reporter: Reporter) {
  console.log('fetching order ids');

  let ordersId = {};
  try {
    ordersId = readJSON('./output/order-ids.json')
  } catch(error) {}

  let year = config.year;
  console.log('year:', year);
  ordersId[year] = ordersId[year] || {};

  for(let month = 1; month<=maxMonth; month++) {
    console.log('month:', month);
    ordersId[year][month] = await reporter.getMonthOrderIds(month, year)
  }

  writeJSON('./output/order-ids.json', ordersId)
}

export async function getOrders(reporter: Reporter) {
  console.log('fetching orders');

  let orders = {};
  try {
    orders = readJSON('./output/orders.json')
  } catch(error) {}

  let year = config.year;
  console.log('year:', year);
  orders[year] = orders[year] || {}

  for (let month = 1; month <= maxMonth; month++) {
    console.log('month:', month);
    orders[year][month] = orders[year][month] || {}

    const monthOrderIds = await reporter.getMonthOrderIds(month, year)

    for (let orderId of monthOrderIds) {
      const orderData = await reporter.getOrder(orderId);
      orders[year][month][orderId] = Object.assign({}, orders[year][month][orderId], orderData)
    }
  }

  writeJSON('./output/orders.json', orders)
}