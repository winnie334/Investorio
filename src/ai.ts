import {startPortfolio, Stock} from "./gameLogic.ts";
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
    prices: Record<Stock, number[]>;

    constructor(type: AiType, startingBalance: number, newPrices: Record<Stock, number[]>) {
        this.type = type;
        this.balance = startingBalance;
        this.portfolio = {...startPortfolio};
        this.prices = newPrices;
    }

    update() { // should be called once a day!
        if (this.type === AiType.MONKEY) {
            if (Math.random() < MONKEY_CHANCE) this.monkeyLogic()
        } else while (this.balance >= this.prices[Stock.ALL][day()]) this.buy(Stock.ALL, 1);
    }

    monkeyLogic() {
        if (Math.random() < MONKEY_BUY_CHANCE) {
            // Monkey buys something, get all stocks that we can buy at least one of
            const affordable = Object.entries(this.prices).filter(([_, p]) => p[day()] <= this.balance);
            if (affordable.length) {
                // Pick a random one and buy a random amount
                const [i, p] = affordable[Math.random() * affordable.length];
                this.buy(+i, Math.floor(Math.random() * this.balance / p[day()]) + 1);
            }
        } else {
            // Sell a random amount of stocks that we have at least one of
            const owned = Object.entries(this.portfolio).filter(([_, q]) => q > 0);
            if (owned.length) {
                const [i, q] = owned[Math.random() * owned.length];
                this.sell(+i, Math.floor(Math.random() * q) + 1);
            }
        }
    }

    getPortfolioValue() {
        return Object.entries(this.portfolio).reduce((acc, [k, v]) => acc + this.prices[+k][day()] * v, 0);
    }

    buy(stock: Stock, quantity: number) {
        const cost = quantity * this.prices[stock][day()];
        if (this.balance < cost) return;

        this.balance -= cost;
        this.portfolio[stock] += quantity;
    }

    sell(stock: Stock, quantity: number) {
        if (this.portfolio[stock] < quantity) return;

        this.portfolio[stock] -= quantity;
        this.balance += this.prices[stock][day()] * quantity;
    }
}
