const API_KEY = '31ccf75561fc8823fddcafbaf3aaa73a2103801aed07e9b1129e734088f1ec5e'

const tickersHandlers = new Map();

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

socket.addEventListener('message', e => {
    const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data);

    const AGGREGATE_INDEX = "5";

    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return
    }
    
    const handlers = tickersHandlers.get(currency) ?? [];

    handlers.forEach(fn => fn(newPrice))
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
        socket.send(stringifyMessage);
        return;
    }

    socket.addEventListener('open', () => {
        socket.send(stringifyMessage);
    }, { once: true })
    
}


const subscribeToTickerOnWs = (ticker) => {
    sendToWebSocket({
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~USD`]
    });
}

const unSubscribeToTickerOnWs = (ticker) => {
    sendToWebSocket({
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~USD`]
    });
}

export const subscribeToTicker = (ticker, callback) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, callback]);
    subscribeToTickerOnWs(ticker)
}

export const unsubscribeToTicker = (ticker) => {
    tickersHandlers.delete(ticker)
    unSubscribeToTickerOnWs(ticker)
}


