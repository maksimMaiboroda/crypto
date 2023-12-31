<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="isLoading"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <AddTicketSection @add-ticker="handleAddTicker" :tickersList="tickersList" />

      <hr v-if="filteredAndPaginatedList.length" class="w-full border-t border-gray-600 my-4" />

      <div class="flex justify-between">
        <div class="max-w-xs">
          <label for="filterInput" class="block text-sm font-medium text-gray-700">Filter:</label>
          <div class="mt-1 relative rounded-md shadow-md">
            <input
              v-model="filterValue"
              type="text"
              name="filterInput"
              id="filterInput"
              class="p-2 block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Please, input filter value"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            v-show="pageNumber > 1"
            @click="handleClickPageBth('prev')"
            class="m-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {{ '<— Prev page' }}
          </button>

          <button
            type="button"
            v-show="pageSize * pageNumber < tickersList.length"
            @click="handleClickPageBth('next')"
            class="m-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {{ 'Next page —>' }}
          </button>
        </div>
      </div>

      <hr v-if="filteredAndPaginatedList.length" class="w-full border-t border-gray-600 my-4" />

      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          v-for="ticker in filteredAndPaginatedList"
          :key="ticker.id"
          @click="handleSelectTicker(ticker)"
          class="bg-white overflow-hidden shadow rounded-lg border-4 border-transparent border-solid cursor-pointer"
          :class="`${ticker?.id === selectedTicker?.id && 'border-4 border-purple-800'} ${
            ticker.price === null && 'bg-red-100'
          }`"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ `${ticker.symbol} - USD` }}
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ formatPrice(ticker.price) }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
            @click.stop="handleDeleteTicker(ticker)"
            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#718096"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Delete
          </button>
        </div>
      </dl>
      <hr v-if="filteredAndPaginatedList.length" class="w-full border-t border-gray-600 my-4" />
      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.symbol }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64" ref="graph">
          <div
            v-for="(graphItem, index) in normalizedGraph"
            :key="index"
            :style="{ height: `${graphItem}%` }"
            class="bg-purple-800 border w-10"
            ref="graphColumn"
          />
        </div>
        <button @click="() => (this.graph = [])" type="button" class="absolute top-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeToTicker } from './api'
import { v4 as uuid } from 'uuid'
import AddTicketSection from './components/AddTicketSection.vue'

export default {
  // -- Refactoring --

  // [x] 6. There are dependent data in state | Critical: 5+
  // [ ] 2. When delete ticker, subscribe on updating ticket should remove too | Critical: 5
  // [ ] 4. Api calls just in component (???) | Critical: 5
  // [ ] 5. Errors handling API | Critical: 5
  // [x] 8. When ticker deleting the localStorage don't change | Critical: 4
  // [ ] 3. Many extra calls to api | Critical: 4
  // [x] 1. The same code in watch | Critical: 3
  // [ ] 7. Graphic looks bad when many prices | Critical: 2
  // [H] 9. localStorage and incognito mode | Critical: 2
  // [ ] 10. Magic strings and numbers | Critical: 2

  // Also
  //
  // [x] Graphic doesn't work when there are the save value
  // [ ] When delete tickets on last page user should get to previous page if it exists
  // [ ] Add Shared Worker wor working with web socket (task which can describe at interview)
  //
  //
  //

  data() {
    return {
      filterValue: '',
      tickersList: [],
      selectedTicker: null,
      isLoading: false,
      graph: [],
      maxGraphWith: 0,
      graphColumnWidth: 0,
      tickersListStorageKey: 'tickets-list',
      pageNumber: 1,
      pageSize: 6
    }
  },

  components: {
    AddTicketSection
  },

  created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())
    const VALID_KEYS = ['filter', 'page']
    const tickersList = localStorage.getItem(this.tickersListStorageKey)

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key]
      }
    })

    if (tickersList) {
      this.tickersList = JSON.parse(tickersList)

      for (const ticker of this.tickersList) {
        subscribeToTicker(ticker.symbol, (newPrice) => this.updateTickers(ticker.symbol, newPrice))
      }
    }
  },

  mounted() {
    window.addEventListener('resize', this.updateMaxWithGraph)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.updateMaxWithGraph)
  },

  watch: {
    tickersList() {
      localStorage.setItem(this.tickersListStorageKey, JSON.stringify(this.tickersList))
    },

    selectedTicker() {
      this.graph = []
      this.$nextTick(() => {
        this.updateMaxWithGraph()
      })
    },

    graph: {
      handler() {
        if (this.$refs.graphColumn?.[0].clientWidth && !this.graphColumnWidth) {
          this.$nextTick(() => {
            this.graphColumnWidth = this.$refs.graphColumn?.[0].clientWidth
            this.updateMaxWithGraph()
          })
        }
      },
      deep: true
    },

    filterValue() {
      this.pageNumber = 1
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      )
    }
  },

  computed: {
    endIndex() {
      return this.pageNumber * this.pageSize
    },

    startIndex() {
      return this.endIndex - this.pageSize
    },

    filteredList() {
      return this.tickersList.filter((ticket) =>
        ticket.symbol?.includes(this.filterValue.toUpperCase())
      )
    },

    filteredAndPaginatedList() {
      return this.filteredList.slice(this.startIndex, this.endIndex)
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph)
      const minValue = Math.min(...this.graph)

      if (maxValue === minValue) {
        return this.graph.map(() => 50)
      }

      const newGraph = this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      )

      return newGraph
    },

    pageStateOptions() {
      return {
        filter: this.filterValue,
        page: this.pageNumber
      }
    },

    toManyTickersAdded() {
      return this.tickersList > 10
    }
  },

  methods: {
    formatPrice(price) {
      if (price === '-' || price === null) return '-'

      const numberPrice = Number(price)
      return numberPrice > 1 ? numberPrice.toFixed(2) : numberPrice.toPrecision(2)
    },

    updateTickers(tickerName, price) {
      this.tickersList
        .filter((t) => t.symbol === tickerName)
        .forEach((t) => {
          t.price = price

          if (this.selectedTicker && t.symbol === this.selectedTicker.symbol) {
            this.graph.push(price)

            while (this.graph.length > this.maxGraphWith && this.maxGraphWith) {
              this.graph.shift()
            }
          }
        })
    },

    updateMaxWithGraph() {
      if (this.$refs.graph?.clientWidth && this.graphColumnWidth) {
        this.maxGraphWith = this.$refs.graph.clientWidth / this.graphColumnWidth
      }
    },

    async handleAddTicker(currency) {
      this.filterValue = ''

      const currentTicker = {
        symbol: currency.toUpperCase(),
        id: uuid(),
        price: '-'
      }

      this.tickersList = [...this.tickersList, currentTicker]
      subscribeToTicker(currency.toUpperCase(), (newPrice) =>
        this.updateTickers(currency.toUpperCase(), newPrice)
      )
    },

    handleSelectTicker(ticker) {
      this.selectedTicker = ticker
    },

    handleDeleteTicker(ticker) {
      this.tickersList = this.tickersList.filter(
        (t) => t.symbol.toLowerCase() !== ticker.symbol.toLowerCase()
      )

      if (this.selectedTicker && ticker.id === this.selectedTicker.id) {
        this.selectedTicker = null
      }

      unsubscribeToTicker(ticker.symbol)
    },

    handleClickPageBth(action) {
      if (action === 'next') {
        this.pageNumber = Number(this.pageNumber) + 1
      }

      if (action === 'prev' && this.pageNumber !== 1) {
        this.pageNumber = Number(this.pageNumber) - 1
      }
    }
  }
}
</script>
