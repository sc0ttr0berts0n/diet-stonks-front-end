// @ts-ignore
var app = new Vue({
    el: '#app',
    data: {
        apiResponse: null,
        activeStock: '',
        stocks: [],
        comments: [],
    },
    beforeMount() {
        this.fetchAPI();
    },
    methods: {
        async fetchAPI() {
            const res = await fetch('https://diet-stonks.herokuapp.com/api');
            const data = await res.json();
            this.stocks = data.data.map((stock) => {
                return { ...stock, isActive: false };
            });
            this.apiResponse = data;

            // bind comments to stock
            this.stocks = this.stocks.map((stock) => {
                const symbol = stock.symbol;
                const rawEntry = data.raw.data.find(
                    (entry) => entry.symbol === symbol
                );
                return {
                    ...stock,
                    comments: rawEntry.comments,
                    name: rawEntry.name,
                };
            });
        },
        handleStockClick(stock) {
            this.toggleStock(stock);
            this.populateComments(stock);
        },
        toggleStock(stock) {
            const wasActive = stock.isActive;
            this.stocks.forEach((stock) => (stock.isActive = false));
            stock.isActive = !wasActive;
        },
        populateComments(stock) {
            this.activeStock = stock.symbol;
            this.comments = stock.comments;
        },
    },
    computed: {
        cosmeticTime: function () {
            const time = new Date(this.apiResponse?.raw.unixTimestamp);
            return time.toLocaleTimeString('en-US');
        },
    },
});
