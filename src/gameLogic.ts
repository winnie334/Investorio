import {updateGraphData} from "./graph.ts";
import {getGameWorld} from "./gameWorld.ts";
import {addText, updateTextValue} from "./models.ts";
import {ai, AiType} from "./ai.ts";
import * as THREE from "three";
import {updateMonkeyComparator} from "./monkeyComparator.ts";
import {Narrator} from "./narrator.ts";

export enum Stock {
    Apple,
    Potato,
    Fish,
    MoonLoops,
    WORLD,
}

export const stockNames = {
    [Stock.WORLD]: 'World',
    [Stock.Potato]: 'Potatos',
    [Stock.Apple]: 'Apples',
    [Stock.Fish]: 'Fish',
    [Stock.MoonLoops]: 'Moonloops',
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
    [Stock.Potato]: 0,
    [Stock.Apple]: 0,
    [Stock.Fish]: 0,
    [Stock.MoonLoops]: 0
};

const STARTING_BALANCE = 1000
const SECS_PER_DAY = 1
const DAYS_PER_YEAR = 5; // We only have 500 stock data points xp
const FINAL_AGE = 31;
const STARTING_AGE = 20;

let gameLogic = createGameLogic();

export let allPrices: number[][] = [];

async function loadPriceData() {
    const files = ['baba', 'irtc', 'bats', 'gme', 'iwda'];
    allPrices = await Promise.all(
        files.map(f =>
            fetch(`/${f}.csv`)
                .then(r => r.text())
                .then(t => t.trim().split('\n').slice(1).map(l => parseFloat(l.split(',')[4].replace(/"/g, ''))))
                .then(t => t.reverse())
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
    let gameFinishTime = -1;
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

    let narrator = new Narrator();

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
        console.log("Selected", stock);
        selectedStock = stock;
        updateGraphData(stock, secondsPassed);

        const selectedStockElement = gameWorld.getRoomObjects()?.selectedStock;
        if (!selectedStockElement) return;

        updateQuantityUI();
        updateOrderUI();
        updateTextValue(
            selectedStockElement,
            `Stock: ${stockNames[getSelectedStock()] || 'None'}`
        );

        const models = gameWorld.getRoomObjects().selectStockModels as THREE.Mesh[];

        models.forEach((model, index) => {
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = index === stock ? 1.0 : 0.3;
                }
            });
        });
    }

    function updatePortfolioUI() {
        updateProfitUI();
        const portfolioElements = gameWorld.getRoomObjects()?.portFolioTexts;
        if (!portfolioElements) return;

        Object.keys(portfolio).forEach(stock => {
            // @ts-ignore
            const value = Math.round(portfolio[stock] * allPrices[+stock][day]);
            // @ts-ignore
            updateTextValue(portfolioElements?.[stock], `${stockNames[stock]}: $${value} (${portfolio[stock].toString()})`);
        });
    }

    function updateOrderUI() {
        const orderElement = gameWorld.getRoomObjects()?.orderElement;
        if (!orderElement) return;

        updateTextValue(orderElement, "$" + (currentQuantity * allPrices[selectedStock][day]).toFixed(1));
    }

    function incrementQuantity() {
        currentQuantity += 1;
        updateQuantityUI();
        updateOrderUI();
    }

    function decrementQuantity() {
        if (currentQuantity <= 0) return;
        currentQuantity -= 1;
        updateQuantityUI();
        updateOrderUI();
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
        if (total > balance || total == 0) return false;

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
        updateTotalInvested(-profit)
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

    function update(delta: number) {
        narrator.update(delta);

        if (gameFinishTime != -1) {
            endUpdate();
            return
        }

        timeBeforeNextDay -= delta;
        secondsPassed += delta;
        if (timeBeforeNextDay > 0) return false;

        while (timeBeforeNextDay < 0) {
            dayUpdate();
            timeBeforeNextDay += SECS_PER_DAY
        }

    }

    function dayUpdate() {
        day++;

        updateGraphData(selectedStock, day);
        updateMonkeyComparator()
        updatePortfolioUI()
        updateOrderUI()

        monkey?.update()
        rock?.update()

        if (day % DAYS_PER_YEAR == 0) yearUpdate();
        return true;
    }

    function yearUpdate() {
        year++
        const element = gameWorld.getRoomObjects().year
        updateTextValue(element, `Year: ${year}`)

        // Todo get recurring income
        if (year + STARTING_AGE >= FINAL_AGE && gameFinishTime == -1) triggerEnding()
    }

    function getFinishTime() {
        return gameFinishTime;
    }

    function getMonkeyScore() {
        return monkey?.getPortfolioValue() + monkey.balance || 0
    }

    function getStoneScore() {
        return rock?.getPortfolioValue() + rock.balance || 0
    }

    function updateAllUI() {
        updateBalanceUI(0)
        selectStock(selectedStock)
        updateTotalInvested(totalInvested)
        updatePortfolioUI()
        updateProfitUI()
    }

    function triggerEnding() {
        gameFinishTime = getGameLogic().getTime();
        updateGraphData(selectedStock, day+100000);
        updateTextValue(gameWorld.getRoomObjects()?.graphText, "Your journey has come\nto an end.\nYour net worth is:\n$" + getNetWorth())
        console.log("triggered")
    }

    function endUpdate() {
    }

    function tapBubble() {
        narrator.tapBubble();
    }

    return {
        getBalance,
        getTrades,
        getPortfolio,
        buyStock,
        sellStock,
        update,
        getAge,
        getNetWorth,
        selectStock,
        addToBalance,
        getSelectedStock,
        getTotalInvested,
        getProfit,
        getTotalValue,
        getFinishTime,
        incrementQuantity,
        decrementQuantity,
        getQuantity,
        getTime,
        updateAllUI,
        getMonkeyScore,
        getStoneScore,
        tapBubble
    };
}
