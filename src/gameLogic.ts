import {updateGraphData} from "./graph.ts";
import {getGameWorld} from "./gameWorld.ts";
import {addText, updateTextValue} from "./models.ts";
import {ai, AiType} from "./ai.ts";
import * as THREE from "three";
import {showMonkeyComparator, updateMonkeyComparator} from "./monkeyComparator.ts";
import {Narrator} from "./narrator.ts";
import {playSound, type SoundKey} from "./soundManager.ts";

import baba from './assets/csv/baba.csv';
import irtc from './assets/csv/irtc.csv';
import bats from './assets/csv/bats.csv';
import gme from './assets/csv/gme.csv';
import iwda from './assets/csv/iwda.csv';


export enum Stock {
    Apple,
    Potato,
    Fish,
    MoonLoops,
    WORLD,
}

export const stockNames = {
    [Stock.WORLD]: 'World',
    [Stock.Potato]: 'Potatoes',
    [Stock.Apple]: 'Apples',
    [Stock.Fish]: 'Non-explosive fish',
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

export const stockToSoundMap: Record<Stock, SoundKey> = {
    [Stock.Fish]: "FISH",
    [Stock.Potato]: "POTATO",
    [Stock.MoonLoops]: "MOON",
    [Stock.WORLD]: "MOO",
    [Stock.Apple]: "APPLE",
}


const STARTING_BALANCE = 500
const SECS_PER_DAY = 1.2
const DAYS_PER_YEAR = 12; // We only have 500 stock data points xp
const YEARS_TO_PLAY = 30;
const SPAWN_CASH_EVERY_X_DAY = 20 // amount of days for cash to spawn in
export const CASH_VALUE = 300

let gameLogic = createGameLogic();

export let allPrices: number[][] = [];

async function loadPriceData() {
    const files = [bats, irtc, baba, gme, iwda];
    allPrices = await Promise.all(
        files.map(f =>
            fetch(`${f}`)
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
    let day = -1;
    let year = 0;
    let totalInvested = 0

    let currentQuantity = 0;

    let portfolio: Record<Stock, number> = {...startPortfolio};

    let timeBeforeNextDay = SECS_PER_DAY;
    let selectedStock: Stock = Stock.Apple;

    let monkey = new ai(AiType.MONKEY, STARTING_BALANCE)
    let rock = new ai(AiType.ROCK, STARTING_BALANCE)

    let narrator = new Narrator();

    let daysBeforeSalary = SPAWN_CASH_EVERY_X_DAY;

    let terminalShown = false;
    showTerminal(false);


    function getBalance() {
        return balance;
    }

    function getTrades() {
        return trades;
    }

    function getPortfolio() {
        return portfolio;
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
        playSound("SELECT", 0.06)
        updateGraphData(stock, day);

        const selectedStockElement = gameWorld.getRoomObjects()?.selectedStock;
        if (!selectedStockElement) return;

        updateQuantityUI();
        updateOrderUI();
        updateTextValue(
            selectedStockElement,
            `${stockNames[getSelectedStock()] || 'None'}`
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
        const portfolioElements = gameWorld.getRoomObjects()?.portfolioTexts;
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
        playSound("CLICK")
        updateOrderUI();
    }

    function decrementQuantity() {
        if (currentQuantity <= 0) return;
        currentQuantity -= 1;
        playSound("CLICK")
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
        totalInvested += amount;
        const element = gameWorld.getRoomObjects()?.invested
        if (!element) return;
        updateTextValue(element, `Invested: $${getTotalInvested().toFixed(1)}`)
    }

    function getProfit() {
        return Math.round(getPortfolioValue() - totalInvested);
    }

    function updateProfitUI() {
        const element = gameWorld.getRoomObjects()?.profit
        if (!element) return;
        updateTextValue(element, `P/L: ${getProfit() >= 0 ? '+' : ''}${getProfit().toFixed(1)}`)
    }

    function buyStock(stock: Stock = selectedStock) {
        const currentPrice = allPrices[stock][day]
        let total = currentPrice * currentQuantity;
        if (total > balance || total == 0) {
            playSound("ERROR", 2)
            return false;
        }

        portfolio[stock] += currentQuantity;
        currentQuantity = 0;
        trades.push({stock, price: currentPrice, amount: currentQuantity, date: day, transactionType: 'buy'});

        updateBalanceUI(-total);
        updateTotalInvested(total)
        updatePortfolioUI()
        updateQuantityUI();
        playSound(stockToSoundMap[stock], stock == Stock.WORLD || stock == Stock.MoonLoops ? 0.5 : 1) // Deze zijn fking luid xd

        return true;
    }

    function getSelectedStock() {
        return selectedStock;
    }

    function getTime() {
        return secondsPassed;
    }

    function getDay() {
        return day;
    }

    function sellStock(stock: Stock = selectedStock) {
        const owned = portfolio[stock];
        if (owned < currentQuantity || currentQuantity == 0) {
            playSound("ERROR")
            return false;
        }

        let profit = currentQuantity * allPrices[stock][day];
        trades.push({stock, price: allPrices[stock][day], amount: currentQuantity, date: day, transactionType: 'sell'});
        portfolio[stock] -= currentQuantity;
        currentQuantity = 0;

        updateBalanceUI(profit);
        updateTotalInvested(-profit)
        updatePortfolioUI()
        updateQuantityUI();
        playSound("SELL", 0.1)

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

    function showTerminal(visible: boolean) {
        terminalShown = visible;

        // Dit is echt om van te wenen
        const balance = gameWorld.getRoomObjects()?.balance;
        if (balance) balance.visible = visible;
        const quantity = gameWorld.getRoomObjects()?.quantityElement;
        if (quantity) quantity.visible = visible;
        const order = gameWorld.getRoomObjects()?.orderElement;
        if (order) order.visible = visible;
        const year = gameWorld.getRoomObjects()?.year;
        if (year) year.visible = visible;
        const invested = gameWorld.getRoomObjects()?.invested;
        if (invested) invested.visible = visible;
        const profit = gameWorld.getRoomObjects()?.profit;
        if (profit) profit.visible = visible;
        const screen = gameWorld.getRoomObjects()?.screen;
        if (screen) screen.visible = visible;
        const portfolio = gameWorld.getRoomObjects()?.portfolio;
        if (portfolio) portfolio.visible = visible;
        const panel = gameWorld.getRoomObjects()?.panel;
        if (panel) panel.visible = visible;
        const minus = gameWorld.getRoomObjects()?.minusButton;
        if (minus) minus.visible = visible;
        const plus = gameWorld.getRoomObjects()?.plusButton;
        if (plus) plus.visible = visible;
        const buy = gameWorld.getRoomObjects()?.buyButton;
        if (buy) buy.visible = visible;
        const sell = gameWorld.getRoomObjects()?.sellButton;
        if (sell) sell.visible = visible;
        const portfolioElements = gameWorld.getRoomObjects()?.portfolioTexts;
        console.log("elements: " + portfolioElements)
        if (portfolioElements) Object.values(portfolioElements).forEach(element => element.visible = visible)
    }

    function update(delta: number) {
        narrator.update(delta);

        if (!terminalShown || gameFinishTime != - 1) return

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

        daysBeforeSalary--;
        if (daysBeforeSalary == 0) {
            daysBeforeSalary = SPAWN_CASH_EVERY_X_DAY;
            gameWorld.spawnCash()
            monkey.balance += CASH_VALUE;
            rock.balance += CASH_VALUE;
        }

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

        if (year >= YEARS_TO_PLAY && gameFinishTime == -1) triggerEnding()
    }

    function getFinishTime() {
        return gameFinishTime;
    }

    function getMonkeyScore() {
        return monkey?.getNetWorth()
    }

    function getStoneScore() {
        return rock?.getNetWorth()
    }

    function flattenPlant() {
        let plant = getGameWorld().getRoomObjects()?.plant
        if (plant) plant.scale.y = 0.25
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
        updateGraphData(selectedStock, day + 100000);
        narrator.startEndSpeech()
        showEndSlide(0)
        playSound("FINISH")
        console.log("triggered")
    }

    function showEndSlide(slide: number) {
        const totalCash = STARTING_BALANCE + DAYS_PER_YEAR * YEARS_TO_PLAY / SPAWN_CASH_EVERY_X_DAY * CASH_VALUE;
        switch (slide) {
            case 0:
                updateTextValue(gameWorld.getRoomObjects()?.selectedStock, "")
                updateTextValue(gameWorld.getRoomObjects()?.graphText, ":O")
                break
            case 1:
                updateTextValue(gameWorld.getRoomObjects()?.graphText, "\n   $" + totalCash)
                break
            case 2:
                updateTextValue(gameWorld.getRoomObjects()?.graphText, "\n   $" + totalCash + "\n\n-> $" + getNetWorth().toFixed(1))
                break
            case 3:
                updateTextValue(gameWorld.getRoomObjects()?.graphText, "You: $" + getNetWorth().toFixed(1) + "\nMonkey: $" + monkey.getNetWorth().toFixed(1) + "\nGrandma: $" + rock.getNetWorth().toFixed(1))
                break
            case 4:
                updateTextValue(gameWorld.getRoomObjects()?.graphText, "\n<3")
                break
        }
    }

    function startNarrator() {
        narrator.startYapping();
    }

    function showBarChart() {
        showMonkeyComparator(true);
        // todo portraits
    }

    return {
        getBalance,
        getTrades,
        getPortfolio,
        buyStock,
        sellStock,
        update,
        getNetWorth,
        selectStock,
        addToBalance,
        getSelectedStock,
        getTotalInvested,
        getProfit,
        getTotalValue,
        getDay,
        getFinishTime,
        incrementQuantity,
        decrementQuantity,
        getQuantity,
        getTime,
        updateAllUI,
        getMonkeyScore,
        getStoneScore,
        showTerminal,
        showBarChart,
        startNarrator,
        showEndSlide,
        flattenPlant
    };
}
