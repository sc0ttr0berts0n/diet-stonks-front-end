// @ts-ignore
var app = new Vue({
    el: '#app',
    data: {
        apiResponse: null,
        activeStock: '',
        stocks: [],
        comments: [],
        didScroll: false,
    },
    beforeMount() {
        this.fetchAPI();
    },
    created() {
        window.addEventListener('scroll', this.handleScroll);
        setInterval(
            function () {
                if (this.didScroll) {
                    this.hasScrolled();
                    this.didScroll = false;
                }
            }.bind(this),
            250
        );
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
        redOrGreen(num) {
            return num > 0 ? 'green' : 'red';
        },
        goToTopOfPage() {
            window.scrollTo(0, 0);
        },
        handleScroll() {
            this.didScroll = true;
        },
        hasScrolled() {
            const appContainer = document.body.querySelector('.app--container');
            const depth = window.scrollY;
            if (depth > 800) {
                appContainer.classList.add('app__scrolled');
            } else {
                appContainer.classList.remove('app__scrolled');
            }
        },
    },
    computed: {
        cosmeticTime: function () {
            const time = new Date(this.apiResponse?.raw.unixTimestamp);
            return time.toLocaleTimeString('en-US');
        },
        totalEarnings: function () {
            return this.stocks.reduce((acc, stock) => {
                return acc + stock.price.change;
            }, 0);
        },
        totalCost: function () {
            return this.stocks.reduce((acc, stock) => {
                return acc + stock.price.previousClose;
            }, 0);
        },
        totalPercent: function () {
            return this.totalEarnings / this.totalCost;
        },
        getRandomEmoji: function () {
            const emojis = ['🚀', '🌚', '💎', '🌈', '🙌🏼', '💪', '🍆'];
            return emojis[Math.floor(Math.random() * emojis.length)];
        },
    },
});
