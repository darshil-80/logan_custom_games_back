import Coinpayments from 'coinpayments'
import config from '../configs/app.config'
import axios from 'axios'
import { CONVERT_CURRENCY_FROM, CONVERT_CURRENCY_TO } from '../libs/constants'

export default async (currency, amount) => {
  const options = {
    key: config.get('coin_payments.public_key'),
    secret: config.get('coin_payments.secret')
  }
  console.log('options----------------', options)
  const payload = {
    cmd: 'rates'
  }
  const client = new Coinpayments(options)
  console.log('client----------', client)
  const rateInfo = await client.rates(payload)
  console.log('rateBtc-----', rateInfo[currency].rate_btc)
  const rateBtc = rateInfo[currency].rate_btc
  const amountInBtc = rateBtc * amount

  const conversionUrl = `${config.get('conversion_api.url')}${CONVERT_CURRENCY_FROM}/${CONVERT_CURRENCY_TO}?amount=${amountInBtc}`
  const conversionData = await axios.get(conversionUrl)
  const amountInUsd = conversionData.data.USD
  return { amount, currency, amountInBtc, amountInUsd }
}
