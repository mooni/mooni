import { readJSON, writeCSV } from './utils'

function getAmount(amountArray, currency) {
  const d = amountArray.find(i => i.currency === currency)
  if(!d) return 0
  return d.amount
}

export async function reportsToCSV() {
  const reports = readJSON('./output/reports.json')

  const headers = [
    'year',
    'month',
    'nbExecuted',
    'inputVolumeETH',
    'outputVolumeEUR',
    'outputVolumeCHF',
    'bityFeeETH',
    'partnerFeeETH',
    'partnerProfitETH',
  ];

  const data = []

  for(let year of Object.keys(reports)) {
    const reportYear = reports[year];
    for(let month of Object.keys(reportYear)) {
      const reportMonth = reportYear[month];
      const row = [
        year,
        month,
        reportMonth.executed,
        getAmount(reportMonth.input, 'ETH'),
        getAmount(reportMonth.output, 'EUR'),
        getAmount(reportMonth.output, 'CHF'),
        getAmount(reportMonth.customer_trading_fee, 'ETH'),
        getAmount(reportMonth.partner_fee, 'ETH'),
        getAmount(reportMonth.profit_sharing, 'ETH'),
      ]
      data.push(row)
    }
  }

  writeCSV('./output/reports.csv', data, headers)
}