// @ts-ignore
var app = new Vue({
    el: '#app',
    data: {
        apiResponse: null,
        activeStock: '',
        stocks: [],
        comments: [],
        didScroll: false,
        toTopEmoji: '🚀',
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
            const res = await fetch(
                'https://diet-stonks.herokuapp.com/api/v1/wsa'
            );
            const data = await res.json();
            this.stocks = data.data.map((stock) => {
                return { ...stock, isActive: false };
            });
            this.apiResponse = data;

            // bind comments to stock
            this.stocks = this.stocks.map((stock) => {
                const symbol = stock.symbol;
                const rawEntry = data.comments.filter(
                    (entry) => entry.symbol === symbol
                );
                return {
                    ...stock,
                    comments: rawEntry,
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
            return num >= 0 ? 'green' : 'red';
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
                this.toTopEmoji = this.getRandomEmoji();
            } else {
                appContainer.classList.remove('app__scrolled');
                this.toTopEmoji = this.getRandomEmoji();
            }
        },
        getRandomEmoji() {
            const emojis = ['🚀', '🌚', '💎', '🌈', '🙌🏼', '💪', '🍆'];
            return emojis[Math.floor(Math.random() * emojis.length)];
        },
        calcEarnings(filterFunction = () => true) {
            return this.stocks.filter(filterFunction).reduce((acc, stock) => {
                return acc + stock.price.change;
            }, 0);
        },
        calcCost(filterFunction = () => true) {
            return this.stocks.filter(filterFunction).reduce((acc, stock) => {
                return acc + stock.price.current;
            }, 0);
        },
        calcPercent(a, b) {
            return `${((a / b) * 100).toFixed(2)}%`;
        },
    },
    computed: {
        cosmeticTime: function () {
            const time = new Date(this.apiResponse?.raw.unixTimestamp);
            return time.toLocaleTimeString('en-US');
        },
        cards: function () {
            const isPos = (el) => el.index >= 0;
            const isNeg = (el) => el.index < 0;
            return [
                {
                    title: 'All',
                    cost: this.calcCost().toFixed(2),
                    earnings: this.calcEarnings().toFixed(2),
                    percent: this.calcPercent(
                        this.calcEarnings(),
                        this.calcCost()
                    ),
                },
                {
                    title: 'Pos IDX',
                    cost: this.calcCost(isPos).toFixed(2),
                    earnings: this.calcEarnings(isPos).toFixed(2),
                    percent: this.calcPercent(
                        this.calcEarnings(isPos),
                        this.calcCost(isPos)
                    ),
                },
                {
                    title: 'Neg IDX',
                    cost: this.calcCost(isNeg).toFixed(2),
                    earnings: this.calcEarnings(isNeg).toFixed(2),
                    percent: this.calcPercent(
                        this.calcEarnings(isNeg),
                        this.calcCost(isNeg)
                    ),
                },
            ];
        },
    },
});
