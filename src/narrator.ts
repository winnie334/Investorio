import {Character, getGameWorld} from "./gameWorld.ts";

type Popup = {
    message: string;
    secsBeforeDisplayed: number;
    character: Character
};

// Wrapper for brevity in messages[]
const m = (content: string, s: number, c: Character = Character.NARRATOR): Popup =>
          ({ message: content, secsBeforeDisplayed: s, character: c });

export class Narrator {
    messages: Popup[] =
        [m("Yo dumbass, listen up.                            ", 5),
         m("I'm here to give you some hot finance advice.", 0),
         m("Bazinga", 3),
         m("I am the monkey and I also exist.             However.                                 Due to severe negligence my portrait is broken.           ", 4, Character.MONKEY)];

    messageIndex = -1; // Last (or current) displayed message
    lastMessageDone = true;

    secondsUntilNextMessage: number = this.messages[0].secsBeforeDisplayed

    update(delta: number) {
        this.countToNextMessage(delta);
    }

    private countToNextMessage(delta: number) {
        if (this.lastMessageDone) this.secondsUntilNextMessage -= delta;
        if (this.secondsUntilNextMessage < 0) {
            this.messageIndex++
            if (this.messageIndex >= this.messages.length - 1) this.secondsUntilNextMessage = 999999
            else this.secondsUntilNextMessage = this.messages[this.messageIndex + 1].secsBeforeDisplayed

            this.lastMessageDone = false;
            getGameWorld().showText(this.messages[this.messageIndex].message, {
                fadeout: this.secondsUntilNextMessage != 0, // Fadeout if the next message is not instantaneous after
                character: this.messages[this.messageIndex].character,
                onDone: () => this.lastMessageDone = true
            })

            console.log("triggered message " + this.messageIndex + ", now waiting " + this.secondsUntilNextMessage + "s")
        }
    }
}