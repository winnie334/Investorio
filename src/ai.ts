import {allPrices, startPortfolio, Stock} from "./gameLogic.ts";
import {getGameLogic} from "./gameLogic.ts";

export enum AiType {
    MONKEY = 'MONKEY',
    ROCK = 'ROCK'
}

function day() {
    return getGameLogic().getTime();
}

const MONKEY_CHANCE = 0.2
const MONKEY_BUY_CHANCE = 0.5

export class ai {
    type: AiType;
    balance: number;
    portfolio: Record<Stock, number>;

    constructor(type: AiType, startingBalance: number) {
        this.type = type;
        this.balance = startingBalance;
        this.portfolio = {...startPortfolio};
    }

    update() { // should be called once a day!
        if (this.type === AiType.MONKEY) {
            if (Math.random() < MONKEY_CHANCE) this.monkeyLogic()
        } else while (this.balance >= allPrices[Stock.WORLD][day()]) this.buy(Stock.WORLD, 1);
    }

    monkeyLogic() {
        if (Math.random() < MONKEY_BUY_CHANCE) {
            // Monkey buys something, get all stocks that we can buy at least one of
            const affordable = Object.entries(allPrices).filter(([_, p]) => p[day()] <= this.balance);
            if (affordable.length > 0) {
                console.log(affordable)
                // Pick a random one and buy a random amount
                const [i, p] = affordable[Math.random() * affordable.length];
                this.buy(+i, Math.floor(Math.random() * this.balance / p[day()]) + 1);
            }
        } else {
            // Sell a random amount of stocks that we have at least one of
            const owned = Object.entries(this.portfolio).filter(([_, q]) => q > 0);
            if (owned.length > 0) {
                const [i, q] = owned[Math.random() * owned.length];
                this.sell(+i, Math.floor(Math.random() * q) + 1);
            }
        }
    }

    getPortfolioValue() {
        return Object.entries(this.portfolio).reduce((acc, [k, v]) => acc + allPrices[+k][day()] * v, 0);
    }

    buy(stock: Stock, quantity: number) {
        const cost = quantity * allPrices[stock][day()];
        if (this.balance < cost) return;

        this.balance -= cost;
        this.portfolio[stock] += quantity;
    }

    sell(stock: Stock, quantity: number) {
        if (this.portfolio[stock] < quantity) return;

        this.portfolio[stock] -= quantity;
        this.balance += allPrices[stock][day()] * quantity;
    }
}
