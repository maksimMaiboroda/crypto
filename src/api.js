const API_KEY = '31ccf75561fc8823fddcafbaf3aaa73a2103801aed07e9b1129e734088f1ec5e'

const tickersHandlers = new Map()
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

socket.addEventListener('message', async (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    MESSAGE: message,
    PRICE: newPrice,
    PARAMETER: parameter
  } = JSON.parse(e.data)

  const AGGREGATE_INDEX = '5'
  const INVALID_SUB = 'INVALID_SUB'

  if (type === AGGREGATE_INDEX) {
    const handlers = tickersHandlers.get(currency) ?? []
    handlers.forEach((fn) => fn(newPrice))

    return
  }

  if (message === INVALID_SUB) {
    const parts = parameter.split('~')
    const tickerName = parts[2]
    const subName = parts[3]
    const handlers = tickersHandlers.get(tickerName) ?? []

    if (subName === 'USD') {
      return subscribeToTickerOnWs(tickerName, 'BTC')
    }

    handlers.forEach((fn) => fn(null))

    return
  }
})

export const getCurrencyList = async () => {
  const res = await fetch('https://min-api.cryptocompare.com/data/blockchain/list', {
    method: 'GET',
    headers: {
      authorization: `Apikey ${API_KEY}`
    }
  })
  const data = await res.json()

  return data.Data
}

function sendToWebSocket(message) {
  const stringifyMessage = JSON.stringify(message)

  if (socket.readyState === socket.OPEN) {
    socket.send(stringifyMessage)
    return
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifyMessage)
    },
    { once: true }
  )
}

const subscribeToTickerOnWs = (ticker, currency) => {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~${currency}`]
  })
}

const unSubscribeToTickerOnWs = (ticker, currency) => {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~${currency}`]
  })
}

export const subscribeToTicker = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, callback])
  subscribeToTickerOnWs(ticker, 'USD')
}

export const unsubscribeToTicker = (ticker) => {
  tickersHandlers.delete(ticker)
  unSubscribeToTickerOnWs(ticker, 'USD')
}
