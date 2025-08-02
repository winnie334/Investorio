import {updateGraphData} from "./graph.ts";
import {getGameWorld} from "./gameWorld.ts";
import {updateTextValue} from "./models.ts";
import {ai, AiType} from "./ai.ts";

// @ts-ignore
export enum Stock {
    GRAIN = "1",
    WEED = "2",
    TUNGSTEN = "3",
    CURCUMA = "4",
    ALL = "5"
}

export type Trade = {
    stock: Stock,
    price: number,
    amount: number,
    date: Date,
    transactionType: 'buy' | 'sell',
}

const startPortfolio: Record<Stock, number> = {
    [Stock.GRAIN]: 0,
    [Stock.WEED]: 0,
    [Stock.TUNGSTEN]: 0,
    [Stock.CURCUMA]: 0,
    [Stock.ALL]: 0,
};

const startStockToPrice: Record<Stock, number[]> = {
    [Stock.GRAIN]: [],
    [Stock.WEED]: [],
    [Stock.TUNGSTEN]: [],
    [Stock.CURCUMA]: [],
    [Stock.ALL]: [],
}
const STARTING_BALANCE = 1000
const UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS = 1
const GAME_DURATION_IN_SECONDS = 3600;
const FINAL_AGE = 60;
const STARTING_AGE = 20;

const monkey = new ai(AiType.MONKEY, STARTING_BALANCE)
const rock   = new ai(AiType.ROCK  , STARTING_BALANCE)

let gameLogic = createGameLogic();


async function loadPriceData() {
    const files = ['baba', 'bats', 'gme', 'irtc', 'sp500'];
    return await Promise.all(
        files.map(f =>
            fetch(`/${f}.csv`)
                .then(r => r.text())
                .then(t => t.trim().split('\n').slice(1).map(l => parseFloat(l.split(',')[4].replace(/"/g, ''))))
        )
    );
}

export function getGameLogic() {
    return gameLogic
}


function createGameLogic() {
    const gameWorld = getGameWorld()


    let balance = STARTING_BALANCE;
    let trades: Trade[] = [];
    let isGameFinished = false;
    let hasGameStarted = false;
    let time = 0; // in seconds
    let totalInvested = 0

    let currentAge = STARTING_AGE;

    let portfolio: Record<Stock, number> = {...startPortfolio};
    let stockToPricesMap: Record<Stock, number[]> = {...startStockToPrice}

    let timeLeftBeforeLogicUpdate = UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
    let selectedStock: Stock = Stock.ALL;

    let amountMoneyToInvest = 50;

    loadPriceData().then(priceData => {
        Object.values(Stock).forEach((stock, index) => {
            stockToPricesMap[(stock as Stock)] = priceData[index]
        })
    })


    function start() {
        balance = STARTING_BALANCE;
        trades = [];
        hasGameStarted = true;
        time = 0;
        portfolio = startPortfolio;
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
        return stockToPricesMap[stock];
    }

    function getAge() {
        return currentAge
    }

    function getMarketIndex() {
        return Object.values(stockToPricesMap).reduce((acc, val) => acc + val[val.length - 1], 0);
    }

    function getPortfolioValue() {
        return Object.entries(portfolio).reduce((acc, [stock, amountOfStock]) => {
            // @ts-ignore
            return acc + stockToPricesMap[stock][stockToPricesMap[stock].length - 1] * amountOfStock
        }, 0);
    }


    function getNetWorth() {
        return balance + getPortfolioValue();
    }

    function selectStock(stock: Stock) {
        console.log("Selected", stock)
        selectedStock = stock;
        updateGraphData(stockToPricesMap[stock], time);
    }

    function getTotalInvested() {
        return totalInvested;
    }

    function getTotalValue() {
        return getProfit() + getTotalInvested();
    }


    function setAmountToInvest(amount: number) {
        amountMoneyToInvest = amount;
        const amountToInvestElement = gameWorld.getRoomObjects()?.amountToInvest
        if (!amountToInvestElement) return;
        updateTextValue(amountToInvestElement, amount.toString())
    }

    function getAmountToInvest() {
        return amountMoneyToInvest;
    }

    function getProfit() {
        return Math.round(getPortfolioValue() - totalInvested)
    }


    function buyStock(stock: Stock = selectedStock, money: number = amountMoneyToInvest) {
        const currentPrice = stockToPricesMap[stock].at(-1) ?? 1;
        if (money > balance && money > 0) return false;

        const amount = money / currentPrice;
        portfolio[stock] += amount;

        totalInvested += money;
        updateGameBalance(-money)

        trades.push({stock, price: currentPrice, amount, date: new Date(), transactionType: 'buy'});
        return true;

    }

    function getSelectedStock() {
        return selectedStock;
    }

    function getLatestStockPrice(stock: Stock) {
        return stockToPricesMap[stock].at(-1) ?? 1;
    }

    function getTime() {
        return time;
    }

    function sellStock(stock: Stock = selectedStock, money: number = amountMoneyToInvest) {
        const owned = portfolio[stock];
        const amountStocksToSell = money / getLatestStockPrice(stock)
        if (owned < amountStocksToSell) return false;

        updateGameBalance(money);
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

    function addToBalance(amount: number) {
        updateGameBalance(amount);
    }

    function updateGameBalance(amount: number) {
        balance += amount;
        const balanceElement = gameWorld.getRoomObjects()?.balance
        if (balanceElement) updateTextValue(balanceElement, balance.toString())
    }

    function updateStocks() {
        // TODO add winand logic
    }

    function update(delta: number): boolean {
        if (isGameFinished || !hasGameStarted) return false;
        timeLeftBeforeLogicUpdate -= delta;
        if (timeLeftBeforeLogicUpdate > 0) return false;
        timeLeftBeforeLogicUpdate = UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
        time += UPDATE_LOGIC_TIME_INTERVAL_IN_SECONDS;
        if (time > GAME_DURATION_IN_SECONDS) isGameFinished = true;
        currentAge = Math.min(FINAL_AGE, Math.floor(time / GAME_DURATION_IN_SECONDS * (FINAL_AGE - STARTING_AGE) + STARTING_AGE));

        updateGraphData(stockToPricesMap[selectedStock], time);

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
        addToBalance,
        getSelectedStock,
        getTotalInvested,
        getAmountToInvest,
        setAmountToInvest,
        getProfit,
        getTotalValue,
        getTime
    };
}
