import {Stock} from "./gameLogic.ts";
import {allPrices} from "./graph.ts";
import {getGameLogic} from "./gameLogic.ts";

export enum AiType {
    AAP = 'AAP',
    ROCK = 'ROCK'
}

function day() {
    return getGameLogic().getTime();
}

class ai {
    type: AiType;
    balance: number;
    portfolio: Record<Stock, number>;

    constructor(type: AiType, startingBalance: number) {
        this.type = type;
        this.balance = startingBalance;
        this.portfolio = {[Stock.AAPL]: 0, [Stock.MSFT]: 0, [Stock.GOOG]: 0, [Stock.AMZN]: 0, [Stock.VT]: 0};
    }

    update() {
        if (this.type === AiType.AAP) {
            // Todo buy random
        }
        else while (this.balance > allPrices[Stock.VT][day()]) this.buy(Stock.VT, 1);
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
