<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Ticker</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="inputValueCurrency"
            v-on:keyup.enter="handleAddTicker(inputValueCurrency)"
            type="text"
            name="wallet"
            id="wallet"
            class="p-2 block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="For example DOGE"
          />
        </div>

        <div
          v-if="matchedCurrencies.length"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            v-for="currency in matchedCurrencies"
            :key="currency"
            @click="handleAddTicker(currency)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ currency }}
          </span>
        </div>
        <div v-if="showError" class="text-sm text-red-600">This ticker is already exist!</div>
      </div>
    </div>
    <AddButton @click="handleAddTicker(inputValueCurrency)" :disabled="toManyTickersAdded" />
  </section>
</template>
<script>
import { getCurrencyList } from '../api.js'
import AddButton from './AddButton.vue'

export default {
  components: {
    AddButton
  },

  props: {
    tickersList: Object
  },

  emits: {
    'add-ticker': (value) => typeof value === 'string' && value.length > 0
  },

  data() {
    return {
      currencyById: {},
      inputValueCurrency: '',
      showError: false
    }
  },

  mounted() {
    const fetchCurrencyList = async () => {
      const fetchedCurrency = await getCurrencyList()
      this.currencyById = fetchedCurrency
    }

    fetchCurrencyList()
  },

  watch: {
    inputValueCurrency() {
      this.showError = false
    }
  },

  computed: {
    currencyList() {
      return Object.keys(this.currencyById)
    },

    matchedCurrencies() {
      const matched = []

      if (this.inputValueCurrency) {
        for (const currency of this.currencyList) {
          if (matched.length === 4) {
            break
          }
          if (currency.toLowerCase().includes(this.inputValueCurrency.toLowerCase())) {
            matched.push(currency)
          }
        }
      }

      return matched
    }
  },

  methods: {
    checkTicker(symbol) {
      return this.tickersList.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase())
    },
    handleAddTicker(value) {
      if (this.checkTicker(value)) {
        this.showError = true

        return
      }

      this.showError = false

      this.$emit('add-ticker', value)
    }
  }
}
</script>
