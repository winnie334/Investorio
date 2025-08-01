import {updateGraphData} from "./graph.ts";

// @ts-ignore
export enum Stock {
    AAPL = 'AAPL',
    MSFT = 'MSFT',
    GOOG = 'GOOG',
    AMZN = 'AMZN',
}

export type Trade = {
    stock: Stock,
    price: number,
    amount: number,
    date: Date,
    transactionType: 'buy' | 'sell',
}

const startPortfolio: Record<Stock, number> = {
    [Stock.AAPL]: 0,
    [Stock.MSFT]: 0,
    [Stock.GOOG]: 0,
    [Stock.AMZN]: 0,
};


const startStockToPrice: Record<Stock, number[]> = {
    [Stock.AAPL]: [100],
    [Stock.MSFT]: [200],
    [Stock.GOOG]: [150],
    [Stock.AMZN]: [250],
}
const STARTING_BALANCE = 1000
const UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS = 1
const GAME_DURATION_IN_SECONDS = 3600;
const FINAL_AGE = 80;
const STARTING_AGE = 20;


export function createGameLogic() {
    let balance = 0;
    let trades: Trade[] = [];
    let isGameFinished = false;
    let time = 0;

    let currentAge = STARTING_AGE;

    let portfolio: Record<Stock, number> = {...startPortfolio};
    let stockToPriceMap: Record<Stock, number[]> = {...startStockToPrice}

    let timeLeftBeforeLogicUpdate = UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
    let selectedStock: Stock | undefined;

    function start() {
        balance = STARTING_BALANCE;
        trades = [];
        isGameFinished = false;
        time = 0;
        portfolio = startPortfolio;
        stockToPriceMap = startStockToPrice;
    }


    function getPrices(stock: Stock) {
        return stockToPriceMap[stock];
    }

    function getMarketIndex() {
        return Object.values(stockToPriceMap).reduce((acc, val) => acc + val[val.length - 1], 0);
    }

    function getPortfolioValue() {
        return Object.entries(portfolio).reduce((acc, [stock, amountOfStock]) => {
            // @ts-ignore
            return acc + stockToPriceMap[stock][stockToPriceMap[stock].length - 1] * amountOfStock
        }, 0);
    }


    function getNetWorth() {
        return balance + getPortfolioValue();
    }

    function selectStock(stock: Stock) {
        selectedStock = stock;
        console.log('Selected stock', stock);
        updateGraphData(getSelectedStockHistoricData());

    }

    function getSelectedStockHistoricData() {
        if (selectedStock === undefined) return stockToPriceMap[Stock.AAPL].map((_, index) => {
            return Object.values(stockToPriceMap).reduce((acc, val) => acc + val[index], 0)
        })
        return stockToPriceMap[selectedStock]
    }

    function buyStock(stock: Stock, money: number) {
        const currentPrice = stockToPriceMap[stock].at(-1) ?? 1;
        if (money > balance) return false;

        const amount = money / currentPrice;
        portfolio[stock] += amount;
        balance -= money;

        trades.push({stock, price: currentPrice, amount, date: new Date(), transactionType: 'buy'});
        return true;
    }

    function sellStock(stock: Stock, amount: number) {
        const owned = portfolio[stock];
        if (owned < amount) return false;

        const price = stockToPriceMap[stock].at(-1) ?? 1;
        balance += amount * price;
        portfolio[stock] -= amount;

        trades.push({stock, price, amount, date: new Date(), transactionType: 'sell'});
        return true;
    }

    function addToBalance(amount: number) {
        balance += amount;
    }

    function updateStocks() {
        for (const stock of Object.values(Stock)) {
            const prices = stockToPriceMap[stock];
            const last = prices.at(-1) ?? 100;
            const newPrice = last + (Math.random() - 0.45) * 10;
            prices.push(Math.max(newPrice, 1));
            if (prices.length > 100) prices.shift();
            stockToPriceMap[stock] = prices
        }
    }

    function update(delta: number) {
        if (isGameFinished) return;
        timeLeftBeforeLogicUpdate -= delta;
        if (timeLeftBeforeLogicUpdate > 0) return;
        timeLeftBeforeLogicUpdate = UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
        time += UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
        if (time > GAME_DURATION_IN_SECONDS) isGameFinished = true;
        currentAge = Math.min(FINAL_AGE, Math.floor(time / GAME_DURATION_IN_SECONDS * (FINAL_AGE - STARTING_AGE) + STARTING_AGE));
        updateGraphData(getSelectedStockHistoricData());

        updateStocks();
    }


    return {
        balance,
        trades,
        portfolio,
        getPrices,
        buyStock,
        sellStock,
        update,
        start,
        isFinished: () => isGameFinished,
        getMarketIndex,
        currentAge,
        getNetWorth,
        selectedStock,
        selectStock,
        getSelectedStockHistoricData,
        addToBalance
    };
}
