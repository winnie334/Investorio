import {Character, getGameWorld} from "./gameWorld.ts";
import {getGameLogic} from "./gameLogic.ts";
import {showMonkeyComparator} from "./monkeyComparator.ts";
import {setShowGraph} from "./graph.ts";

type Popup = {
    message: string;
    secsBeforeDisplayed: number;
    character: Character;
    onStart?: () => void;
    onDone?: () => void;
};

type PopupParams = {
    character?: Character;
    onStart?: () => void;
    onDone?: () => void;
};

// Wrapper for brevity in messages[]
const m = (
    content: string,
    s: number,
    options: PopupParams = {}
): Popup => ({
    message: content,
    secsBeforeDisplayed: s,
    character: options.character ?? Character.NARRATOR,
    onStart: options.onStart,
    onDone: options.onDone
});

export class Narrator {
    messages: Popup[] = [
        m("I WANT a GRAPH", 5),
        m(
            "HERE IS A BIG CHART LOL",
            4,
            {
                character: Character.MONKEY, onStart: () => {
                    const gameLogic = getGameLogic()
                    showMonkeyComparator(true)
                    setShowGraph(true)
                }, onDone: () => {
                    getGameLogic().startGame()
                }
            }
        ),
        m("I'm here to give you some hot finance advice.", 0),
        m("Bazinga", 3),
    ];

    messageIndex = -1;
    lastMessageDone = true;
    secondsUntilNextMessage: number = this.messages[0].secsBeforeDisplayed;

    update(delta: number) {
        this.countToNextMessage(delta);
    }

    private countToNextMessage(delta: number) {
        if (this.lastMessageDone) this.secondsUntilNextMessage -= delta;

        if (this.secondsUntilNextMessage < 0) {
            this.messageIndex++;
            if (this.messageIndex >= this.messages.length) {
                this.secondsUntilNextMessage = 999999;
                return;
            }

            const message = this.messages[this.messageIndex];
            this.secondsUntilNextMessage = this.messages[this.messageIndex + 1]?.secsBeforeDisplayed ?? 999999;

            this.lastMessageDone = false;

            message.onStart?.();

            getGameWorld().showText(message.message, {
                fadeout: this.secondsUntilNextMessage !== 0,
                character: message.character,
                onDone: () => {
                    this.lastMessageDone = true;
                    message.onDone?.();
                }
            });

            console.log(`triggered message ${this.messageIndex}, now waiting ${this.secondsUntilNextMessage}s`);
        }
    }
}
