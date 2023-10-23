const API_KEY = '31ccf75561fc8823fddcafbaf3aaa73a2103801aed07e9b1129e734088f1ec5e'

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

export const fetchCurrencyPrice = async (name, priceCurrency) => {
  const res = await fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=${name}&tsyms=${priceCurrency}`,
    {
      method: 'GET',
      headers: {
        authorization: `Apikey ${API_KEY}`
      }
    }
  )

  const data = await res.json()

  return data
}

