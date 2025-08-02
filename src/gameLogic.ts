import {updateGraphData} from "./graph.ts";
import {ai, AiType} from "./ai.ts";

export enum Stock {
    VT,
    AAPL,
    MSFT,
    GOOG,
    AMZN,
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
    [Stock.VT]: 0
};

const startStockToPrice: Record<Stock, number[]> = {
    [Stock.VT]: [],
    [Stock.AAPL]: [100],
    [Stock.MSFT]: [200],
    [Stock.GOOG]: [150],
    [Stock.AMZN]: [250]
}


const STARTING_BALANCE = 1000
const UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS = 1
const GAME_DURATION_IN_SECONDS = 3600;
const FINAL_AGE = 60;
const STARTING_AGE = 20;

const monkey = new ai(AiType.MONKEY, STARTING_BALANCE)
const rock   = new ai(AiType.ROCK  , STARTING_BALANCE)

let gameLogic = createGameLogic();

export function getGameLogic() {
    return gameLogic
}


function createGameLogic() {
    let balance = STARTING_BALANCE;
    let trades: Trade[] = [];
    let isGameFinished = false;
    let time = 0;
    let totalInvested = 0

    let currentAge = STARTING_AGE;

    let portfolio: Record<Stock, number> = {...startPortfolio};
    let stockToPriceMap: Record<Stock, number[]> = {...startStockToPrice}

    let timeLeftBeforeLogicUpdate = UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
    let selectedStock: Stock | undefined;
    let amountMoneyToInvest = 50;

    function start() {
        balance = STARTING_BALANCE;
        trades = [];
        isGameFinished = false;
        time = 0;
        portfolio = startPortfolio;
        stockToPriceMap = startStockToPrice;
    }

    function getBalance() {
        return balance;
    }

    function getTrades() {
        return trades;
    }

    function getPortfolio() {
        return portfolio;
    }


    function getPrices(stock: Stock) {
        return stockToPriceMap[stock];
    }

    function getAge() {
        return currentAge
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

    function selectStock(stock: Stock | undefined = undefined) {
        selectedStock = stock;
        console.log('Selected stock', stock);
        updateGraphData(stock, time);
    }

    function getTotalInvested() {
        return totalInvested;
    }

    function setAmountToInvest(amount: number) {
        amountMoneyToInvest = amount;
    }

    function getAmountToInvest() {
        return amountMoneyToInvest;
    }

    function getProfit() {
        return Math.round(getPortfolioValue() - totalInvested)
    }


    function getSelectedStockHistoricData() {
        if (selectedStock === undefined) return stockToPriceMap[Stock.AAPL].map((_, index) => {
            return Object.values(stockToPriceMap).reduce((acc, val) => acc + val[index], 0)
        })
        return stockToPriceMap[selectedStock]
    }

    function buyStock(stock: Stock | undefined = selectedStock, money: number = amountMoneyToInvest) {
        if (!stock) {
            // we split the amount through all stocks
            Object.values(Stock).forEach(stock => {
                const divider = Object.values(Stock).length
                buyStock(stock, money / divider)
            })
        } else {
            const currentPrice = stockToPriceMap[stock].at(-1) ?? 1;
            if (money > balance && money > 0) return false;

            const amount = money / currentPrice;
            portfolio[stock] += amount;

            totalInvested += money;
            balance -= money;

            trades.push({stock, price: currentPrice, amount, date: new Date(), transactionType: 'buy'});
            return true;
        }

    }

    function getSelectedStock() {
        return selectedStock;
    }

    function getLatestStockPrice(stock: Stock) {
        return stockToPriceMap[stock].at(-1) ?? 1;
    }

    function sellStock(stock: Stock | undefined = selectedStock, money: number = amountMoneyToInvest) {
        if (!stock) {
            Object.values(Stock).forEach(stock => {
                const divider = Object.values(Stock).length
                sellStock(stock, money / divider)
            })
        } else {
            const owned = portfolio[stock];
            const amountStocksToSell = money / getLatestStockPrice(stock)
            if (owned < amountStocksToSell) return false;

            balance += money;
            totalInvested -= money;
            totalInvested = Math.max(0, totalInvested)
            portfolio[stock] -= amountStocksToSell;

            trades.push({
                stock,
                price: getLatestStockPrice(stock),
                amount: amountStocksToSell,
                date: new Date(),
                transactionType: 'sell'
            });
            return true;
        }

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

    function update(delta: number): boolean {
        if (isGameFinished) return false;

        timeLeftBeforeLogicUpdate -= delta;
        if (timeLeftBeforeLogicUpdate > 0) return false;

        timeLeftBeforeLogicUpdate = UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
        time += UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
        if (time > GAME_DURATION_IN_SECONDS) isGameFinished = true;

        currentAge = Math.min(FINAL_AGE, Math.floor(time / GAME_DURATION_IN_SECONDS * (FINAL_AGE - STARTING_AGE) + STARTING_AGE));

        updateGraphData(selectedStock, time);

        updateStocks();

        monkey.update()
        rock.update()

        return true;
    }


    return {
        getBalance,
        getTrades,
        getPortfolio,
        getPrices,
        buyStock,
        sellStock,
        update,
        start,
        isFinished: () => isGameFinished,
        getMarketIndex,
        getAge,
        getNetWorth,
        selectStock,
        getSelectedStockHistoricData,
        addToBalance,
        getSelectedStock,
        getTotalInvested,
        getAmountToInvest,
        setAmountToInvest,
        getProfit
    };
}
