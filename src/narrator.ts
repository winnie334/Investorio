import {getGameWorld} from "./gameWorld.ts";
import {getGameLogic} from "./gameLogic.ts";
import {updateTextValue} from "./models.ts";

export class Narrator {
    messages = [["what's up dumbass", 2], ["It's ya boy", 0], ["... you know, ya boy?", 3], ["Whatever.", 1]]
    messageIndex = -1; // Last (or current) displayed message
    bubble = getGameWorld().getRoomObjects()?.textBubble
    txt = getGameWorld().getRoomObjects()?.textBubbleElement

    currentlyVisible = false;
    secondsUntilNextMessage: number = this.messages[0][1] as number

    loadModels() {
        this.bubble = getGameWorld().getRoomObjects()?.textBubble
        this.txt = getGameWorld().getRoomObjects()?.textBubbleElement
    }

    update(delta: number) {
        this.onlyPolishInThisGame();
        this.countToNextMessage(delta);
    }

    private countToNextMessage(delta: number) {
        if (!this.currentlyVisible) this.secondsUntilNextMessage -= delta;
        if (this.secondsUntilNextMessage < 0) {
            this.setVisible(true)
            updateTextValue(this.txt, this.messages[this.messageIndex++][0])
            if (this.messageIndex == this.messages.length - 1) {this.secondsUntilNextMessage = 999999; return}
            this.secondsUntilNextMessage = this.messages[this.messageIndex + 1][1] as number
            console.log("displayed index " + this.messageIndex + ", now waiting " + this.secondsUntilNextMessage)
        }
    }

    private onlyPolishInThisGame() {
        if (this.bubble === undefined || this.txt === undefined) {this.loadModels(); return}
        this.bubble.position.y = 5.2 + 0.15 * Math.sin(getGameLogic().getTime())
        this.txt.position.y = 6.2 + 0.15 * Math.sin(getGameLogic().getTime())
        this.bubble.rotation.y = Math.PI / 2 + 0.04 * Math.sin(getGameLogic().getTime())
        this.txt.rotation.y = 0.04 * Math.sin(getGameLogic().getTime())
    }

    tapBubble() {
        this.setVisible(false)
    }

    setVisible(visible: boolean) {
        if (this.bubble === undefined || this.txt === undefined) {this.loadModels(); return}

        this.bubble.visible = visible;
        this.txt.visible = visible;
        this.currentlyVisible = visible;
    }
}