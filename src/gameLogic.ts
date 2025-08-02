import {updateGraphData} from "./graph.ts";
import {getGameWorld} from "./gameWorld.ts";
import {updateTextValue} from "./models.ts";
import {ai, AiType} from "./ai.ts";

export enum Stock {
    WORLD,
    GRAIN,
    WEED,
    TUNGSTEN,
    CURCUMA
}

export type Trade = {
    stock: Stock,
    price: number,
    amount: number,
    date: number,
    transactionType: 'buy' | 'sell',
}

export const startPortfolio: Record<Stock, number> = {
    [Stock.WORLD]: 0,
    [Stock.GRAIN]: 0,
    [Stock.WEED]: 0,
    [Stock.TUNGSTEN]: 0,
    [Stock.CURCUMA]: 0
};

const STARTING_BALANCE = 1000
const SECS_PER_DAY = 1
const DAYS_PER_YEAR = 12; // We only have 500 stock data points xp
const FINAL_AGE = 60;
const STARTING_AGE = 20;

let gameLogic = createGameLogic();

export let allPrices: number[][] = [];
async function loadPriceData() {
    const files = ['baba', 'bats', 'gme', 'irtc', 'sp500'];
    allPrices = await Promise.all(
        files.map(f =>
            fetch(`/${f}.csv`)
                .then(r => r.text())
                .then(t => t.trim().split('\n').slice(1).map(l => parseFloat(l.split(',')[4].replace(/"/g, ''))))
        )
    );
}

await loadPriceData();

export function getGameLogic() {
    return gameLogic
}


function createGameLogic() {
    const gameWorld = getGameWorld()


    let balance = STARTING_BALANCE;
    let trades: Trade[] = [];
    let isGameFinished = false;
    let secondsPassed = 0; // in seconds
    let day = 0;
    let year = 0;
    let totalInvested = 0

    let portfolio: Record<Stock, number> = {...startPortfolio};

    let timeBeforeNextDay = SECS_PER_DAY;
    let selectedStock: Stock = Stock.WORLD;


    let amountMoneyToInvest = 50;

    let monkey = new ai(AiType.MONKEY, STARTING_BALANCE)
    let rock = new ai(AiType.ROCK, STARTING_BALANCE)

    function getBalance() {
        return balance;
    }

    function getTrades() {
        return trades;
    }

    function getPortfolio() {
        return portfolio;
    }

    function getAge() {
        return STARTING_AGE + year;
    }

    function getPortfolioValue() {
        return Object.entries(portfolio).reduce((acc, [s, q]) => acc + allPrices[+s][day] * q, 0);
    }

    function getNetWorth() {
        return balance + getPortfolioValue();
    }

    function selectStock(stock: Stock) {
        console.log("Selected", stock)
        selectedStock = stock;
        updateGraphData(stock, secondsPassed);
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
        const currentPrice = allPrices[stock][day]
        if (money > balance && money > 0) return false;

        const amount = money / currentPrice;
        portfolio[stock] += amount;

        totalInvested += money;
        updateGameBalance(-money)

        trades.push({stock, price: currentPrice, amount, date: day, transactionType: 'buy'});
        return true;

    }

    function getSelectedStock() {
        return selectedStock;
    }

    function getTime() {
        return secondsPassed;
    }

    function sellStock(stock: Stock = selectedStock, money: number = amountMoneyToInvest) {
        const owned = portfolio[stock]; // todo: param is money to sell?
        const amountStocksToSell = money / allPrices[stock][day]
        if (owned < amountStocksToSell) return false;

        updateGameBalance(money);
        totalInvested -= money;
        totalInvested = Math.max(0, totalInvested)
        portfolio[stock] -= amountStocksToSell;

        trades.push({ stock, price: allPrices[stock][day], amount: amountStocksToSell, date: day, transactionType: 'sell' });
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

    function update(delta: number): boolean {
        if (isGameFinished) return false;

        timeBeforeNextDay -= delta;
        if (timeBeforeNextDay > 0) return false;

        return dayUpdate();
    }

    function dayUpdate() {
        day++;
        timeBeforeNextDay = SECS_PER_DAY; // todo make updates consistent
        secondsPassed += SECS_PER_DAY;

        if (day % DAYS_PER_YEAR == 0) yearUpdate();

        updateGraphData(selectedStock, secondsPassed);

        monkey?.update()
        rock?.update()

        return true;
    }

    function yearUpdate() {
        year++
        // Todo get recurring income
        if (year == FINAL_AGE) isGameFinished = true;
    }

    return {
        getBalance,
        getTrades,
        getPortfolio,
        buyStock,
        sellStock,
        update,
        isFinished: () => isGameFinished,
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
        getTime,
    };
}
