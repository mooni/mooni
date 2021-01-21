import config from './config'

import { Reporter } from './reporter'
import { getOrders, getOrderIds, getReports } from './reports'
import { reportsToCSV } from './csv'


async function run(): Promise<void> {
  const reporter = new Reporter()
  await reporter.initializeAuth(config.bityClientId, config.bityClientSecret)

  await getOrderIds(reporter)
  await getOrders(reporter)
  await getReports(reporter)
  await reportsToCSV()
}

run().catch(console.error)
