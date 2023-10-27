const API_KEY = '31ccf75561fc8823fddcafbaf3aaa73a2103801aed07e9b1129e734088f1ec5e'

const tickersHandlers = new Map();

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

// export const fetchCurrencyPrice = async (name, priceCurrency) => {
//   const res = await fetch(
//     `https://min-api.cryptocompare.com/data/price?fsym=${name}&tsyms=${priceCurrency}`,
//     {
//       method: 'GET',
//       headers: {
//         authorization: `Apikey ${API_KEY}`
//       }
//     }
//   )

//   const data = await res.json()

//   return data
// }


const loadTickers = async () => {
    if (tickersHandlers.size === 0) {
        return
    }

    const res = await fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD`,
        {
        method: 'GET',
        headers: {
            authorization: `Apikey ${API_KEY}`
        }
        }
    )

    const rawData = await res.json()
    const updatedPrices = Object.fromEntries(Object.entries(rawData).map(([key, value]) => [key, value['USD']]))

    Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];

        handlers.forEach(fn => fn(newPrice))
    })
    

}

export const subscribeToTicker = (ticker, callback) => {
    const subscribers = tickersHandlers.get(ticker) || [];

    tickersHandlers.set(ticker, [...subscribers, callback])
}

export const unsubscribeToTicker = (ticker) => {
    console.log('Unsubscribe:', ticker)
    tickersHandlers.delete(ticker)
}


setInterval(loadTickers, 5000);

