import {updateGraphData} from "./graph.ts";
import {getGameWorld} from "./gameWorld.ts";
import {updateTextValue} from "./models.ts";
import {ai, AiType} from "./ai.ts";

export enum Stock {
    GRAIN,
    WEED,
    TUNGSTEN,
    CURCUMA,
    WORLD, // TODO important that this on is on the same index as sp500
}

export const stockNames = {
    [Stock.WORLD]: 'World',
    [Stock.GRAIN]: 'Grain',
    [Stock.WEED]: 'Weed',
    [Stock.TUNGSTEN]: 'Tungsten',
    [Stock.CURCUMA]: 'Curcuma',
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

    let currentQuantity = 0;

    let portfolio: Record<Stock, number> = {...startPortfolio};

    let timeBeforeNextDay = SECS_PER_DAY;
    let selectedStock: Stock = Stock.WORLD;

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
        return Object.entries(portfolio).reduce((acc, [s, q]) => acc + allPrices[+s][day] * q, 0); // dit is chinees xd
    }

    function getNetWorth() {
        return balance + getPortfolioValue();
    }

    function selectStock(stock: Stock) {
        console.log("Selected", stock)
        selectedStock = stock;
        updateGraphData(stock, secondsPassed);

        const selectedStockElement = gameWorld.getRoomObjects()?.selectedStock
        if (!selectedStockElement) return;
        updateTextValue(selectedStockElement, `Selected Stock: ${stockNames[getSelectedStock()] || 'None'}`)
    }

    function updatePortfolioUI() {
        updateProfitUI();
        const portfolioElements = gameWorld.getRoomObjects()?.portFolioTexts;
        if (!portfolioElements) return;

        Object.keys(portfolio).forEach(stock => {
            const value = Math.round(portfolio[stock] * allPrices[stock][day]);
            updateTextValue(portfolioElements?.[stock], `${stockNames[stock]}: $${value} (${portfolio[stock].toString()})`);
        });
    }

    function incrementQuantity() {
        currentQuantity += 1;
        updateQuantityUI();
    }

    function decrementQuantity() {
        if (currentQuantity <= 0) return;
        currentQuantity -= 1;
        updateQuantityUI();
    }

    function updateQuantityUI() {
        updateTextValue(gameWorld.getRoomObjects()?.quantityElement, currentQuantity)
    }

    function getQuantity() {
        return currentQuantity;
    }

    function getTotalInvested() {
        return Math.max(0, totalInvested);
    }

    function getTotalValue() {
        return getProfit() + getTotalInvested();
    }

    function updateTotalInvested(amount: number) {
        totalInvested = amount;
        const element = gameWorld.getRoomObjects()?.invested
        if (!element) return;
        updateTextValue(element, `Invested: $${getTotalInvested()}`)
    }

    function getProfit() {
        return Math.round(getPortfolioValue() - totalInvested)
    }

    function updateProfitUI() {
        const element = gameWorld.getRoomObjects()?.profit
        if (!element) return;
        updateTextValue(element, `P/L: $${getTotalValue()} (${getProfit() >= 0 ? '+' : ''}${getProfit()})`)
    }

    function buyStock(stock: Stock = selectedStock) {
        const currentPrice = allPrices[stock][day]
        let total = currentPrice * currentQuantity;
        if (total > balance) return false;

        portfolio[stock] += currentQuantity;
        currentQuantity = 0;
        trades.push({stock, price: currentPrice, amount: currentQuantity, date: day, transactionType: 'buy'});

        updateBalanceUI(-total);
        updateTotalInvested(total)
        updatePortfolioUI()
        updateQuantityUI();

        return true;
    }

    function getSelectedStock() {
        return selectedStock;
    }

    function getTime() {
        return secondsPassed;
    }

    function sellStock(stock: Stock = selectedStock) {
        const owned = portfolio[stock];
        if (owned < currentQuantity) return false;

        let profit = currentQuantity * allPrices[stock][day];
        trades.push({stock, price: allPrices[stock][day], amount: currentQuantity, date: day, transactionType: 'sell'});
        portfolio[stock] -= currentQuantity;
        currentQuantity = 0;

        updateBalanceUI(profit);
        updateTotalInvested(totalInvested)
        updatePortfolioUI()
        updateQuantityUI();

        return true;
    }

    function addToBalance(amount: number) {
        updateBalanceUI(amount);
    }

    function updateBalanceUI(amount: number) {
        balance += amount;
        const balanceElement = gameWorld.getRoomObjects()?.balance
        if (balanceElement) updateTextValue(balanceElement, `Balance: $${Math.floor(balance)}`)
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
        updatePortfolioUI()

        monkey?.update()
        rock?.update()

        return true;
    }

    function yearUpdate() {
        year++
        // Todo get recurring income
        if (year == FINAL_AGE) isGameFinished = true;
    }

    function updateAllUI() {
        updateBalanceUI(0)
        selectStock(selectedStock)
        updateTotalInvested(totalInvested)
        updatePortfolioUI()
        updateProfitUI()
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
        getProfit,
        getTotalValue,
        incrementQuantity,
        decrementQuantity,
        getQuantity,
        getTime,
        updateAllUI
    };
}
